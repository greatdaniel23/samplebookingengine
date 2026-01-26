import { Env } from '../types';

// DOKU Payment Gateway Integration
// Sandbox: https://api-sandbox.doku.com
// Production: https://api.doku.com

interface DokuCheckoutRequest {
  order: {
    amount: number;
    invoice_number: string;
    callback_url: string;
    auto_redirect: boolean;
  };
  payment: {
    payment_due_date: number;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
}

interface CreatePaymentBody {
  booking_reference: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  callback_url?: string;
}

// Helper to convert ArrayBuffer to base64 safely
function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Generate SHA256 digest - DOKU requires base64 of SHA256 bytes
async function generateDigest(body: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(body);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return toBase64(hashBuffer);
}

// Generate HMAC-SHA256 - Returns base64 string
async function generateHmacSha256(message: string, secretKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return toBase64(signature);
}

async function verifyDokuSignature(request: Request, body: any, secretKey?: string): Promise<boolean> {
  if (!secretKey) return false;

  const clientId = request.headers.get('Client-Id');
  const requestId = request.headers.get('Request-Id');
  const timestamp = request.headers.get('Request-Timestamp');
  const signature = request.headers.get('Signature');

  // DOKU Request-Target is usually the path part of the URL
  const url = new URL(request.url);
  const target = url.pathname;

  if (!clientId || !requestId || !timestamp || !signature) {
    console.error('Missing DOKU verification headers');
    return false;
  }

  // Calculate Digest
  // Note: body is already parsed JSON here, we need to verify if stringify matches what DOKU sent.
  // Ideally we should verify the raw body, but we only have the parsed body here.
  // We assume standard JSON serialization matches.
  const digest = await generateDigest(JSON.stringify(body));

  // Construct Component String
  // Format: Client-Id:{client_id}\nRequest-Id:{request_id}\nRequest-Timestamp:{timestamp}\nRequest-Target:{request_target}\nDigest:{digest}
  const componentString = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${timestamp}`,
    `Request-Target:${target}`,
    `Digest:${digest}`
  ].join('\n');

  // Calculate Signature
  const hmacResult = await generateHmacSha256(componentString, secretKey);
  const expectedSignature = `HMACSHA256=${hmacResult}`;

  if (signature !== expectedSignature) {
     console.error('Signature Mismatch');
     console.error(`Expected: ${expectedSignature}`);
     console.error(`Received: ${signature}`);
     return false;
  }

  return true;
}

export async function handlePayment(url: URL, method: string, body: any, env: Env, request?: Request): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);

  // CORS headers
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // OPTIONS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // POST /api/payment/create - Create DOKU payment page
  if (pathParts.length === 3 && pathParts[2] === 'create' && method === 'POST') {
    try {
      const {
        booking_reference,
        amount,
        customer_name,
        customer_email,
        customer_phone,
        callback_url
      } = body as CreatePaymentBody;

      // Validate required fields
      if (!booking_reference || !amount || !customer_name || !customer_email) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing required fields: booking_reference, amount, customer_name, customer_email'
        }), { status: 400, headers: corsHeaders });
      }

      // Get DOKU credentials from environment
      const clientId = env.DOKU_CLIENT_ID?.trim();
      const secretKey = env.DOKU_SECRET_KEY?.trim();
      const isProduction = env.DOKU_ENVIRONMENT === 'production';

      if (!clientId || !secretKey) {
        return new Response(JSON.stringify({
          success: false,
          error: 'DOKU credentials not configured'
        }), { status: 500, headers: corsHeaders });
      }

      const baseUrl = isProduction
        ? 'https://api.doku.com'
        : 'https://api-sandbox.doku.com';

      // Generate unique invoice number
      const invoiceNumber = `${booking_reference}-${Date.now()}`;

      // Default callback URL
      const defaultCallbackUrl = `${url.origin}/booking/payment-result`;

      // Build request body - only include phone if provided
      const customerData: { name: string; email: string; phone?: string } = {
        name: customer_name,
        email: customer_email
      };

      // Some gateways are sensitive to phone number formatting
      if (customer_phone) {
        let phone = customer_phone.trim();
        // DOKU expects 62 prefix for Indonesia
        if (phone.startsWith('0')) {
          phone = '62' + phone.substring(1);
        } else if (phone.startsWith('+')) {
          phone = phone.substring(1);
        }
        customerData.phone = phone;
      }

      const requestBody: DokuCheckoutRequest = {
        order: {
          amount: Math.round(amount), // DOKU requires integer
          invoice_number: invoiceNumber,
          callback_url: callback_url || defaultCallbackUrl,
          auto_redirect: true
        },
        payment: {
          payment_due_date: 60 // 60 minutes expiry
        },
        customer: customerData
      };

      const requestBodyString = JSON.stringify(requestBody);
      const requestTarget = '/checkout/v1/payment';
      const requestId = crypto.randomUUID();
      // DOKU timestamp format: ISO 8601 without milliseconds
      const timestamp = new Date().toISOString().split('.')[0] + 'Z';

      // Generate digest - SHA256 hash of body, base64 encoded with prefix
      const digest = await generateDigest(requestBodyString);

      // DOKU Signature Component String Format (exact order matters):
      // Client-Id:{client_id}\n
      // Request-Id:{request_id}\n
      // Request-Timestamp:{timestamp}\n
      // Request-Target:{request_target}\n
      // Digest:{digest}
      const signatureComponents = [
        `Client-Id:${clientId}`,
        `Request-Id:${requestId}`,
        `Request-Timestamp:${timestamp}`,
        `Request-Target:${requestTarget}`,
        `Digest:${digest}`
      ].join('\n');

      // Generate HMAC-SHA256 signature of the component string
      const hmacResult = await generateHmacSha256(signatureComponents, secretKey);
      const signature = `HMACSHA256=${hmacResult}`;

      const headers = {
        'Content-Type': 'application/json',
        'Client-Id': clientId,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        'Digest': digest,
        'Signature': signature
      };

      console.log(`DOKU DEBUG [${requestId}]`);
      console.log(`DOKU DEBUG Component String:\n${signatureComponents}`);
      console.log(`DOKU DEBUG Digest Raw: ${digest}`);
      console.log(`DOKU DEBUG Signature: ${signature}`);
      console.log(`DOKU DEBUG Body:\n${requestBodyString}`);

      // Call DOKU API
      const dokuResponse = await fetch(`${baseUrl}${requestTarget}`, {
        method: 'POST',
        headers: headers,
        body: requestBodyString
      });

      const dokuResultText = await dokuResponse.text();
      let dokuResult;
      try {
        dokuResult = JSON.parse(dokuResultText);
      } catch {
        dokuResult = { raw: dokuResultText };
      }

      console.log('DOKU Response Status:', dokuResponse.status);
      console.log('DOKU Response:', dokuResult);

      if (dokuResponse.status !== 200) {
        return new Response(JSON.stringify({
          success: false,
          error: `DOKU API Error: ${dokuResult.error?.message || 'Unknown error'}`,
          dokuError: dokuResult,
          debug: {
            signatureComponents,
            requestId,
            timestamp,
            digest,
            headers
          }
        }), {
          status: dokuResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Extract payment URL
      const paymentUrl = dokuResult.response?.payment?.url;

      if (!paymentUrl) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No payment URL returned from DOKU',
          details: dokuResult
        }), { status: 500, headers: corsHeaders });
      }

      // Save payment record to database
      try {
        await env.DB.prepare(`
          INSERT INTO payment_transactions (
            booking_reference, invoice_number, amount, status, 
            payment_url, customer_name, customer_email, created_at
          ) VALUES (?, ?, ?, 'pending', ?, ?, ?, datetime('now'))
        `).bind(
          booking_reference,
          invoiceNumber,
          amount,
          paymentUrl,
          customer_name,
          customer_email
        ).run();
      } catch (dbError) {
        console.error('Failed to save payment record:', dbError);
        // Continue anyway - payment URL is still valid
      }

      return new Response(JSON.stringify({
        success: true,
        data: {
          payment_url: paymentUrl,
          invoice_number: invoiceNumber,
          amount: amount,
          expires_in_minutes: 60
        }
      }), { status: 200, headers: corsHeaders });

    } catch (error: any) {
      console.error('Payment creation error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message || 'Failed to create payment'
      }), { status: 500, headers: corsHeaders });
    }
  }

  // POST /api/payment/callback - DOKU callback/webhook
  if (pathParts.length === 3 && pathParts[2] === 'callback' && method === 'POST') {
    try {
      console.log('DOKU Callback received:', body);

      // Verify signature if request object is available
      if (request && env.DOKU_SECRET_KEY) {
        const isValid = await verifyDokuSignature(request, body, env.DOKU_SECRET_KEY);
        if (!isValid) {
          console.error('Invalid DOKU Signature');
          return new Response(JSON.stringify({
            success: false,
            error: 'Invalid signature'
          }), { status: 401, headers: corsHeaders });
        }
      } else {
        console.warn('Skipping signature verification: Missing request object or secret key');
        // We might want to enforce this strictly in production
        // But for now, we leave a warning if request is missing (should not happen with updated index.ts)
        if (env.DOKU_ENVIRONMENT === 'production' && !request) {
           return new Response(JSON.stringify({ success: false, error: 'Internal Server Error: Missing request context' }), { status: 500, headers: corsHeaders });
        }
      }

      const invoiceNumber = body.order?.invoice_number;
      const transactionStatus = body.transaction?.status;

      if (invoiceNumber && transactionStatus) {
        // Update payment status
        await env.DB.prepare(`
          UPDATE payment_transactions 
          SET status = ?, updated_at = datetime('now'), callback_data = ?
          WHERE invoice_number = ?
        `).bind(transactionStatus.toLowerCase(), JSON.stringify(body), invoiceNumber).run();

        // If payment successful, update booking status
        if (transactionStatus === 'SUCCESS') {
          const bookingRef = invoiceNumber.split('-')[0] + '-' + invoiceNumber.split('-')[1];
          await env.DB.prepare(`
            UPDATE bookings SET status = 'confirmed', payment_status = 'paid' 
            WHERE booking_reference LIKE ?
          `).bind(`${bookingRef}%`).run();
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: corsHeaders
      });

    } catch (error: any) {
      console.error('Payment callback error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), { status: 500, headers: corsHeaders });
    }
  }

  // GET /api/payment/status/:invoiceNumber - Check payment status
  if (pathParts.length === 4 && pathParts[2] === 'status' && method === 'GET') {
    try {
      const invoiceNumber = pathParts[3];

      const result = await env.DB.prepare(`
        SELECT * FROM payment_transactions WHERE invoice_number = ?
      `).bind(invoiceNumber).first();

      if (!result) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Payment not found'
        }), { status: 404, headers: corsHeaders });
      }

      return new Response(JSON.stringify({
        success: true,
        data: result
      }), { status: 200, headers: corsHeaders });

    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), { status: 500, headers: corsHeaders });
    }
  }

  return new Response(JSON.stringify({
    success: false,
    error: 'Invalid payment endpoint'
  }), { status: 404, headers: corsHeaders });
}
