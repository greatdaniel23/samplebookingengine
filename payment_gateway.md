# Payment Gateway Documentation (Doku)

## Overview
The application integrates with the **Doku Payment Gateway** to handle secure transactions. The integration is implemented as a Cloudflare Worker in `src/workers/routes/payment.ts`.

## Configuration
The integration uses environment variables for configuration. Ensure these are set in your Cloudflare Worker environment (e.g., via `wrangler.toml` or dashboard).

- `DOKU_CLIENT_ID`: Your Doku Merchant Client ID.
- `DOKU_SECRET_KEY`: Your Doku Secret Key.
- `DOKU_ENVIRONMENT`: Set to `production` for live transactions, otherwise defaults to sandbox.

## Payment Flow
1. **Initiate Payment**: The frontend sends a request to `/api/payment/create` with booking details.
2. **Doku Checkout**: The API generates a payment URL and returns it.
3. **User Payment**: The user is redirected to the Doku payment page to complete the transaction.
4. **Callback**: Doku sends a webhook notification to `/api/payment/callback` upon transaction status change.
5. **Update Status**: The system verifies the signature and updates the booking status in the D1 database.

## API Endpoints

### 1. Create Payment
- **Endpoint**: `POST /api/payment/create`
- **Purpose**: Generates a Doku payment URL for a booking.
- **Body**:
  ```json
  {
    "booking_reference": "BK-12345",
    "amount": 1500000,
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "08123456789", // Optional
    "callback_url": "https://..." // Optional override
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "payment_url": "https://sandbox.doku.com/checkout/...",
      "invoice_number": "BK-12345-1678900000",
      "amount": 1500000,
      "expires_in_minutes": 60
    }
  }
  ```

### 2. Payment Callback
- **Endpoint**: `POST /api/payment/callback`
- **Purpose**: Receives status updates from Doku (Webhook).
- **Behavior**:
  - Verifies the signature to ensure authenticity.
  - Updates `payment_transactions` table.
  - If status is `SUCCESS`, updates `bookings` table to `confirmed` / `paid`.

### 3. Check Status
- **Endpoint**: `GET /api/payment/status/:invoiceNumber`
- **Purpose**: Retrieve the current status of a specific transaction.

## Function Reference
The following functions are implemented in `src/workers/routes/payment.ts`:

### Core Payment Logic
- **`handlePayment(url, method, body, env)`**: Main entry point for payment-related requests. Routes to specific logic based on the path method.
    - **Target**: Routes `/create`, `/callback`, `/status`.
- **`createPayment(body, env)`** (Internal logic within `handlePayment`):
    - **Purpose**: Generates Doku invoice number and signature, then requests payment URL from Doku API.
    - **Connection**: `POST https://api-sandbox.doku.com/checkout/v1/payment`
    - **Database**: Inserts into `payment_transactions`.

### Cryptography Helpers
- **`generateDigest(body)`**: Reference implementation of SHA256 digest generation required by Doku.
    - **Input**: JSON string body.
    - **Output**: Base64 encoded SHA256 hash.
- **`generateHmacSha256(message, secretKey)`**: reference implementation of HMAC-SHA256 signature generation.
    - **Input**: Component string and Secret Key.
    - **Output**: Base64 encoded signature.
- **`toBase64(buffer)`**: Helper to convert ArrayBuffer to base64 string.

### Database Interaction
- **`savePaymentRecord`** (SQL):
  ```sql
  INSERT INTO payment_transactions ...
  ```
- **`updatePaymentStatus`** (SQL):
  ```sql
  UPDATE payment_transactions SET status = ? WHERE invoice_number = ?
  ```

## Security
- **Signature Generation**: Requests to Doku are signed using HMAC-SHA256 with the Client ID, Request ID, Timestamp, and Digest.
- **Signature Verification**: Incoming callbacks should be verified (implementation in `payment.ts` includes signature generation logic which mirrors verification needs).
- **Environment Isolation**: Sandbox and Production URLs are switched based on `DOKU_ENVIRONMENT`.

## Database Schema
The integration relies on a `payment_transactions` table in the D1 database:
```sql
CREATE TABLE IF NOT EXISTS payment_transactions (
  booking_reference TEXT,
  invoice_number TEXT,
  amount REAL,
  status TEXT,
  payment_url TEXT,
  customer_name TEXT,
  customer_email TEXT,
  created_at TEXT,
  updated_at TEXT,
  callback_data TEXT
);
```
