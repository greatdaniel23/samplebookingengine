# DOKU Payment Gateway API Reference

> **Note:** This document is a reference guide compiled from DOKU official documentation artifacts. For specific implementation details regarding this project, please refer to [`DOKU.md`](DOKU.md).

## 1. Introduction

### Preparation for New Merchant

There some step need to be prepared if you want to integrate with DOKU Checkout Page:

#### User Registration

In this section, DOKU Dashboard sandbox environment is used to integration process to our Checkout page. Sandbox is use for testing purpose where you can explore our features without making any real payments. In DOKU, it is very easy to get Sandbox access and explore our products. You can create the account by following the steps [here](https://developers.doku.com/get-started-with-doku-api/user-registration).

#### Retrieving API Keys

Make sure you already have Client ID & Secret Key to continue this section. Please refer to this [section](https://developers.doku.com/get-started-with-doku-api/retrieve-payment-credential).

#### Integration Steps

Here is the overview of how to integrate with Checkout:

1. [Backend Integration to initiate payment](https://developers.doku.com/accept-payments/doku-checkout/integration-guide/backend-integration)
2. [Frontend Integration to display DOKU Checkout Page](https://developers.doku.com/accept-payments/doku-checkout/integration-guide/frontend-integration)
3. [Create payment simulation](https://developers.doku.com/accept-payments/doku-checkout/integration-guide/simulate-payment-and-notification)
4. [Acknowledge payment result](https://developers.doku.com/accept-payments/doku-checkout/integration-guide/simulate-payment-and-notification)

---

## 2. Backend Integration

### Initiate Payment

To obtain the `payment.url`, you will need to hit this API through your Backend.

### Endpoint

| Type | Value |
| :--- | :--- |
| HTTP Method | POST |
| API endpoint (sandbox) | `https://api-sandbox.doku.com/checkout/v1/payment` |
| API endpoint (production) | `https://api.doku.com/checkout/v1/payment` |

### Request Headers

Here is the sample of request header to obtain `payment.url`:

```
Client-Id: MCH-0001-10791114622547
Request-Id: fdb69f47-96da-499d-acec-7cdc318ab2fe
Request-Timestamp: 2020-08-11T08:45:42Z
Signature: HMACSHA256=1jap2tpgvWt83tG4J7IhEwUrwmMt71OaIk0oL0e6sPM=
```

#### Request Header Explanation

| Parameter | Description |
| :--- | :--- |
| **`Client-Id`** | Client ID retrieved from DOKU Back Office |
| **`Request-Id`** | Unique random string (max 128 characters) generated from merchant side to protect duplicate request |
| **`Request-Timestamp`** | Timestamp request on UTC time in ISO8601 UTC+0 format. (e.g., `2020-09-22T01:51:00Z` for 08:51:00 WIB) |
| **`Signature`** | Security parameter generated on merchant Backend. See [Signature Generation](#3-signature-generation). |

### Request Body

#### Basic Request Example

```json
{
    "order": {
        "amount": 20000,
        "invoice_number": "INV-20210231-0001"
    },
    "payment": {
        "payment_due_date": 60
    }
}
```

This basic request supports: Virtual Account, Credit Card, QRIS, Convenience Store, E-money (OVO, Linkaja).

#### Full Request Example

```json
{
"order": {
  "amount": 80000,
  "invoice_number": "INV-{{$timestamp}}",
  "currency": "IDR",
  "callback_url": "http://merchantcallbackurl.domain/",
  "callback_url_cancel": "https://merchantcallbackurl-cancel.domain",
  "callback_url_result": "https://merchantcallbackurl-cancel.domain",
  "language":"EN",
  "auto_redirect":true,
  "disable_retry_payment" :true,
  "recover_abandoned_cart": true,
  "expired_recovered_cart":2,
  "line_items": [
    {
        "id":"001",
        "name":"Fresh flowers",
        "quantity":1,
        "price":40000,
        "sku": "FF01",
        "category": "gift-and-flowers",
        "url": "http://item-url.domain/",
        "image_url":"http://image-url.domain/",
        "type":"ABC"
    },
    {
        "id":"002",
        "name":"T-shirt",
        "quantity":1,
        "price":40000,
        "sku": "T01",
        "category": "clothing",
        "url": "http://item-url.domain/",
        "image_url":"http://image-url.domain/",
        "type":"ABC"
    }
  ]
},
  "payment": {
      "payment_due_date": 60,
      "type" : "SALE",
      "payment_method_types": [
          "VIRTUAL_ACCOUNT_BCA",
          "VIRTUAL_ACCOUNT_BANK_MANDIRI",
          "VIRTUAL_ACCOUNT_BANK_SYARIAH_MANDIRI",
          "VIRTUAL_ACCOUNT_DOKU",
          "VIRTUAL_ACCOUNT_BRI",
          "VIRTUAL_ACCOUNT_BNI",
          "VIRTUAL_ACCOUNT_BANK_PERMATA",
          "VIRTUAL_ACCOUNT_BANK_CIMB",
          "VIRTUAL_ACCOUNT_BANK_DANAMON",
          "VIRTUAL_ACCOUNT_BNC",
          "VIRTUAL_ACCOUNT_BTN",
          "ONLINE_TO_OFFLINE_ALFA",
          "CREDIT_CARD",
          "DIRECT_DEBIT_BRI",
          "EMONEY_SHOPEEPAY",
          "EMONEY_OVO",
          "EMONEY_DANA",
          "QRIS",
          "PEER_TO_PEER_AKULAKU",
          "PEER_TO_PEER_KREDIVO",
          "PEER_TO_PEER_INDODANA"
      ]
  },
  "customer":{
      "id":"JC-01",
      "name":"Zolanda",
      "last_name":"Anggraeni",
      "phone":"628121212121",
      "email": "zolanda@example.com",
      "address":"taman setiabudi",
      "postcode":"120129",
      "state":"Jakarta",
      "city":"Jakarta Selatan",
      "country":"ID"
},
"shipping_address":{
  "first_name":"Joe",
  "last_name":"Doe",
  "address":"Jalan DOKU no 15",
  "city":"Jakarta",
  "postal_code":"11923",
  "phone":"081312345678",
  "country_code":"IDN"
},
"billing_address":{
  "first_name":"Joe",
  "last_name":"Doe",
  "address":"Jalan DOKU no 15",
  "city":"Jakarta",
  "postal_code":"11923",
  "phone":"081312345678",
  "country_code":"IDN"
},
"additional_info":{
  "allow_tenor" : [0,3,6,12],
  "doku_wallet_notify_url" : "https://dw-notification.merchantdomain",
  "override_notification_url": "https://another.example.com/payments/notifications"
}
}
```

#### Request Body Objects

**Order Object**

| Body Parameter | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `order.amount` | number | Mandatory | Order amount in IDR currency and without decimal. Max length: 12 |
| `order.invoice_number` | string | Mandatory | Unique identifier generated by merchant. Max length: 64 (30 for Credit Card). No symbols allowed for KKI. |
| `order.currency` | string | Optional | 3 alphabetic currency code ISO 4217. Default: IDR. |
| `order.callback_url` | string | Conditional | URL for "Back to Merchant" button. Mandatory for Jenius. |
| `order.callback_url_cancel` | string | Conditional | Redirect URL for cancellation. Available for Indodana. |
| `order.callback_url_result` | string | Optional | URL for "Back to Merchant" button in result page. |
| `order.language` | string | Optional | Default language (e.g., "EN"). Max length: 2. |
| `order.auto_redirect` | boolean | Mandatory | If true, redirects to callback URL; otherwise, to payment result page. |
| `order.disable_retry_payment` | boolean | Conditional | If true, disables retry on failure. Applied for CC, Doku Wallet, Akulaku, OVO, ShopeePay. |
| `order.recover_abandoned_cart` | boolean | Conditional | If true, allows recovery of expired order (VA, O2O, CC). |
| `order.expired_recovered_cart` | number | Conditional | Expired time of recovered order (max 44640 mins). |
| `order.line_items.id` | string | Conditional | Mandatory for Akulaku, Kredivo, Indodana, Allobank. Max Length: 64. |
| `order.line_items.name` | string | Conditional | Mandatory for Jenius, Kredivo, Indodana, KKI, Akulaku, Allobank. Max Length: 255. |
| `order.line_items.price` | number | Conditional | Mandatory for Jenius, Kredivo, Akulaku, Indodana, KKI, Allobank. |
| `order.line_items.quantity` | number | Conditional | Mandatory for Jenius, Kredivo, Akulaku, Indodana, KKI, Allobank. |
| `order.line_items.sku` | string | Conditional | Mandatory for Akulaku, Kredivo, Indodana. |
| `order.line_items.category` | string | Conditional | Mandatory for Akulaku, Kredivo, Indodana. See [List Category](#list-category). |
| `order.line_items.url` | string | Conditional | Mandatory for Kredivo. |
| `order.line_items.image_url` | string | Conditional | Mandatory for Indodana. |
| `order.line_items.type` | string | Conditional | Mandatory for Indodana, Kredivo. |

**Payment Object**

| Body Parameter | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `payment.payment_method_types` | array | Optional | Payment methods to show. If omitted, all available are shown. |
| `payment.type` | string | Optional | "SALE", "INSTALLMENT", "AUTHORIZE" (CC only). |
| `payment.payment_due_date` | number | Optional | Payment due date in minutes. Default: 60. Max Length: 6. |

**Customer Object**

| Body Parameter | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `customer.id` | string | Conditional | Mandatory for tokenized payments and Akulaku Paylater. Max Length: 50. |
| `customer.name` | string | Conditional | Mandatory for Jenius, Akulaku, Indodana, Kredivo. Max Length: 255. |
| `customer.last_name` | string | Optional | Max Length: 16. |
| `customer.email` | string | Conditional | Mandatory for Indodana, Kredivo, Allobank. Max Length: 128. |
| `customer.phone` | string | Conditional | Mandatory for Indodana, Akulaku, Kredivo. Format: `{calling_code}{phone_number}`. |
| `customer.address` | string | Conditional | Mandatory for Akulaku. Max Length: 400. |
| `customer.postcode` | string | Conditional | Mandatory for Akulaku. |
| `customer.state` | string | Conditional | Mandatory for Akulaku. |
| `customer.city` | string | Conditional | Mandatory for Akulaku. |
| `customer.country` | string | Optional | ISO 3166-1 code (e.g., ID). |

**Shipping Address Object**

| Body Parameter | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `shipping_address.first_name` | string | Conditional | Mandatory for Kredivo and Indodana. |
| `shipping_address.last_name` | string | Optional | |
| `shipping_address.address` | string | Conditional | Mandatory for Kredivo and Indodana. |
| `shipping_address.city` | string | Conditional | Mandatory for Kredivo and Indodana. |
| `shipping_address.postal_code` | string | Conditional | Mandatory for Kredivo and Indodana. |
| `shipping_address.phone` | string | Conditional | Mandatory for Kredivo and Indodana. |
| `shipping_address.country_code` | string | Conditional | Mandatory for Kredivo and Indodana. |

**Billing Address Object**

| Body Parameter | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `billing_address.first_name` | string | Conditional | Mandatory for Indodana. |
| `billing_address.last_name` | string | Conditional | Mandatory for Indodana. |
| `billing_address.address` | string | Conditional | Mandatory for Indodana. |
| `billing_address.city` | string | Conditional | Mandatory for Indodana. |
| `billing_address.postal_code` | string | Conditional | Mandatory for Indodana. |
| `billing_address.phone` | string | Conditional | Mandatory for Indodana. |
| `billing_address.country_code` | string | Conditional | Mandatory for Indodana. |

**Additional Info Object**

| Body Parameter | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `additional_info.allow_tenor` | number | Optional | Allowed installment tenors (0, 3, 6, 12). |
| `additional_info.doku_wallet_notify_url` | string | Conditional | Only for DOKU Wallet. |
| `additional_info.override_notification_url` | string | Optional | Override configured Notification URL. |

### Response

**Success Response (HTTP 200)**

```json
{
    "message": ["SUCCESS"],
    "response": {
        "order": {
            "amount": "20000",
            "invoice_number": "INV-20210231-0001"
        },
        "payment": {
            "payment_due_date": 60,
            "token_id": "2ebffd22d23e436895ce5c38f7ddcf86...",
            "url": "https://sandbox.doku.com/checkout-link-v2/...",
            "expired_date": "20240712104711"
        }
    }
}
```

**Response Body Explanation**

| Body Parameter | Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `message` | array | Mandatory | Result message (e.g., "SUCCESS"). |
| `response.payment.url` | string | Mandatory | Checkout page URL to display for the customer. |
| `response.payment.token_id` | string | Mandatory | Token generated by DOKU. |
| `response.payment.expired_date` | string | Mandatory | Expiry date (UTC+7) in `yyyyMMddHHmmss`. |
| `response.order.*` | - | - | Mirrors request values. |

**Failed Response (HTTP 400)**

```json
{
    "error_messages": [
        "order.invoice_number must be filled",
        "order.amount must greater than 0"
    ]
}
```

### List Category

List category for `order.line_items.category` (Mandatory for Indodana).

| No | Category | No | Category |
| :--- | :--- | :--- | :--- |
| 1 | airlines | 24 | home-and-garden |
| 2 | arts-crafts-and-collectibles | 25 | hotel-and-travel |
| 3 | automotive | 26 | insurance |
| 4 | baby | 27 | marketplace |
| 5 | beauty-and-fragrances | 28 | nonprofit |
| 6 | biller | 29 | offline-store |
| 7 | books-and-magazines | 30 | others |
| 8 | business-to-business-including-mlm | 31 | over-the-air |
| 9 | charity-and-non-profit | 32 | overseas |
| 10 | clothing | 33 | pets-and-animals |
| 11 | community | 34 | property |
| 12 | digital-content | 35 | public-services |
| 13 | electronics-and-telecom | 36 | religion-and-spirituality |
| 14 | entertainment-and-media | 37 | retail |
| 15 | fee | 38 | services |
| 16 | financial-services-and-products | 39 | sports-and-outdoors |
| 17 | financial-services-and-technology | 40 | telco |
| 18 | food-and-beverage | 41 | ticketing |
| 19 | food-retail-and-service | 42 | toys-and-hobbies |
| 20 | games-voucher | 43 | transportation |
| 21 | gifts-and-flowers | 45 | travel |
| 22 | government | 46 | vehicle-sales |
| 23 | health-and-personal-care | 47 | vehicles-service-and-accessories |

---

## 3. Signature Generation

### Components

The signature requires the following components:

| Name | Description |
| :--- | :--- |
| `Client-Id` | Retrieved from Request Header |
| `Request-Id` | Retrieved from Request Header |
| `Request-Timestamp` | Retrieved from Request/Response Header |
| `Request-Target` | The path of the endpoint (e.g., `/checkout/v1/payment`) |
| `Digest` | Encoded (base64) value of hashed (SHA-256) JSON body (Only for POST) |

### Steps to Generate Signature

1.  **Prepare the String to Sign:**
    Arrange the components separated by a newline (`\n`).

    ```
    Client-Id:MCH-0001-10791114622547
    Request-Id:cc682442-6c22-493e-8121-b9ef6b3fa728
    Request-Timestamp:2020-08-11T08:45:42Z
    Request-Target:/checkout/v1/payment
    Digest:5WIYK2TJg6iiZ0d5v4IXSR0EkYEkYOezJIma3Ufli5s=
    ```

2.  **Calculate HMAC-SHA256:**
    Calculate HMAC-SHA256 of the string using your **Secret Key**.

3.  **Encode to Base64:**
    Encode the result to Base64.

4.  **Format the Header:**
    Prepend `HMACSHA256=` to the signature.

    ```
    Signature: HMACSHA256=OvIRJs/jH8BIcGsktr4d8nnYtxY6E0Uzdm9d1GVgv5s=
    ```

---

## 4. Code Examples

### Node.js Implementation

Sample code to initiate payment using `@doku-id/jokul-nodejs-library`.

```javascript
const Doku = require('@doku-id/jokul-nodejs-library');

// 1. Setup Your Secret Keys
Doku.setup({
    clientId: 'CLIENT_ID_ANDA_DISINI',
    secretKey: 'SECRET_KEY_ANDA_DISINI',
    environment: 'sandbox' // Change to 'production' when live
});

// 2. Function to Create Payment Page
async function createDokuPage() {
    // Generate random invoice number to avoid 'Duplicate Order ID' error
    const invoiceNumber = "INV-" + Date.now();

    const requestBody = {
        order: {
            amount: 50000, // Rp 50.000
            invoice_number: invoiceNumber,
            callback_url: "http://localhost:3000/payment/finish", // Redirect Page (UI)
            auto_redirect: true
        },
        payment: {
            payment_due_date: 60 // Expired in 60 minutes
        },
        customer: {
            name: "User Testing",
            email: "test@example.com"
        }
    };

    try {
        // 3. Send Request to DOKU
        const response = await Doku.Payment.createCheckout(requestBody);

        // 4. Get Payment URL
        const paymentUrl = response.response.payment.url;

        console.log("---------------------------------------");
        console.log("SUCCESS! Please redirect user here:");
        console.log(paymentUrl);
        console.log("---------------------------------------");

        // In a real app (e.g., Express.js):
        // res.redirect(paymentUrl);

    } catch (error) {
        console.error("Failed to create payment page:", error);
    }
}

createDokuPage();
```
