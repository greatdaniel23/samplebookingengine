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
  // Efficient conversion avoiding loop concatenation for small buffers (e.g. payment signatures)
  return btoa(String.fromCharCode.apply(null, bytes as unknown as number[]));
}

// Constant-time string comparison to prevent timing attacks
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  }
  return mismatch === 0;
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

export async function handlePayment(url: URL, method: string, body: any, env: Env, request: Request): Promise<Response> {
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
      // 1. Get credentials
      const clientId = env.DOKU_CLIENT_ID?.trim();
      const secretKey = env.DOKU_SECRET_KEY?.trim();

      if (!clientId || !secretKey) {
        console.error('DOKU credentials missing for callback verification');
        return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), { status: 500, headers: corsHeaders });
      }

      // 2. Read raw body (skipped in index.ts for this route)
      const rawBody = await request.text();
      let parsedBody;
      try {
        parsedBody = JSON.parse(rawBody);
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), { status: 400, headers: corsHeaders });
      }

      // 3. Verify Signature
      const incomingClientId = request.headers.get('Client-Id');
      const incomingRequestId = request.headers.get('Request-Id');
      const incomingTimestamp = request.headers.get('Request-Timestamp');
      const incomingSignature = request.headers.get('Signature');

      if (!incomingClientId || !incomingRequestId || !incomingTimestamp || !incomingSignature) {
         return new Response(JSON.stringify({ success: false, error: 'Missing signature headers' }), { status: 401, headers: corsHeaders });
      }

      if (incomingClientId !== clientId) {
         return new Response(JSON.stringify({ success: false, error: 'Invalid Client ID' }), { status: 401, headers: corsHeaders });
      }

      // 4. Verify Timestamp (Replay Protection)
      const requestTime = new Date(incomingTimestamp).getTime();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (isNaN(requestTime)) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid Timestamp format' }), { status: 400, headers: corsHeaders });
      }

      // Allow 5 minutes drift
      if (Math.abs(now - requestTime) > fiveMinutes) {
          return new Response(JSON.stringify({ success: false, error: 'Request timestamp expired' }), { status: 401, headers: corsHeaders });
      }

      // Calculate Digest
      const digest = await generateDigest(rawBody);

      // Construct Signature Component String
      // Format: Client-Id:{...}\nRequest-Id:{...}\nRequest-Timestamp:{...}\nRequest-Target:{...}\nDigest:{...}
      const requestTarget = url.pathname; // e.g. /api/payment/callback

      const signatureComponents = [
        `Client-Id:${incomingClientId}`,
        `Request-Id:${incomingRequestId}`,
        `Request-Timestamp:${incomingTimestamp}`,
        `Request-Target:${requestTarget}`,
        `Digest:${digest}`
      ].join('\n');

      const hmacResult = await generateHmacSha256(signatureComponents, secretKey);
      const calculatedSignature = `HMACSHA256=${hmacResult}`;

      // Use constant-time comparison
      if (!constantTimeEqual(incomingSignature, calculatedSignature)) {
         console.warn('DOKU Signature Mismatch');
         // Log details safely (mask secrets if printed)
         console.log(`Expected: ${calculatedSignature}, Got: ${incomingSignature}`);
         return new Response(JSON.stringify({ success: false, error: 'Invalid Signature' }), { status: 401, headers: corsHeaders });
      }

      console.log('DOKU Callback verified successfully');
      const body = parsedBody; // Use local parsed body

      const invoiceNumber = body.order?.invoice_number;
      const transactionStatus = body.transaction?.status;

      if (invoiceNumber && transactionStatus) {
        // Update payment status
        await env.DB.prepare(`
          UPDATE payment_transactions 
          SET status = ?, updated_at = datetime('now'), callback_data = ?
          WHERE invoice_number = ?
        `).bind(transactionStatus.toLowerCase(), rawBody, invoiceNumber).run();

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
