# 📧 EMAIL SYSTEM DOCUMENTATION - CLOUDFLARE EDITION
**Villa Booking Engine - Cloudflare Workers + Resend API**

**Last Updated**: January 9, 2026  
**Status**: ✅ **PRODUCTION READY ON CLOUDFLARE**  
**Platform**: Cloudflare Workers with Resend API

---

## 📖 **TABLE OF CONTENTS**

1. [🎯 System Overview](#system-overview)
2. [🏗️ Architecture](#architecture)
3. [🔧 Configuration](#configuration)
4. [📡 API Endpoints](#api-endpoints)
5. [📧 Email Templates](#email-templates)
6. [🧪 Testing](#testing)
7. [⚠️ Limitations & Notes](#limitations)
8. [🔍 Troubleshooting](#troubleshooting)
9. [📋 Production Checklist](#production-checklist)

---

## 🎯 **SYSTEM OVERVIEW** {#system-overview}

### **What Changed from Old System**
| Feature | Old System (PHP/Hostinger) | New System (Cloudflare) |
|---------|---------------------------|-------------------------|
| **Email Service** | PHPMailer + Gmail SMTP | Resend API |
| **Hosting** | Hostinger (PHP) | Cloudflare Workers (TypeScript) |
| **Domain** | api.rumahdaisycantik.com | booking-engine-api.danielsantosomarketing2017.workers.dev |
| **Configuration** | .env file | wrangler-api.toml + Environment Variables |
| **Storage** | MySQL | Cloudflare D1 + KV (for email logs) |

### **Core Email Capabilities** ✅
- **📧 Booking Confirmation**: Beautiful HTML email sent to guests
- **🔔 Admin Notification**: Real-time alerts for new bookings
- **📊 Status Change**: Notification for booking status updates
- **💾 Email Logging**: All sent emails stored in Cloudflare KV (30 days TTL)
- **🎨 Professional Templates**: HTML templates with villa branding

### **Why Resend API?**
Cloudflare Workers **cannot** use:
- ❌ Direct SMTP connections
- ❌ PHP/PHPMailer
- ❌ Gmail SMTP directly

**Solution**: Resend API provides HTTP-based email sending that works perfectly with Cloudflare Workers.

---

## 🏗️ **ARCHITECTURE** {#architecture}

### **System Flow**
```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  Frontend App   │────▶│  Cloudflare Worker   │────▶│  Resend API │
│  (React/Pages)  │     │  (booking-engine-api)│     │  (Email)    │
└─────────────────┘     └──────────────────────┘     └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │ Cloudflare  │
                        │ KV (Logs)   │
                        └─────────────┘
```

### **Infrastructure**
| Component | Details |
|-----------|---------|
| **Worker Name** | `booking-engine-api` |
| **Worker URL** | `https://booking-engine-api.danielsantosomarketing2017.workers.dev` |
| **D1 Database** | `booking-engine` (ID: `71df7f17-943b-46dd-8870-2e7769a3c202`) |
| **KV Namespace** | `CACHE` (ID: `ec304060e11b4215888430acdee7aafa`) |
| **Config File** | `wrangler-api.toml` ⚠️ **IMPORTANT** |

### **Key Files**
```
📁 Project Root/
├── src/workers/
│   └── index.ts                 # ✅ Main Worker with email handlers
├── wrangler-api.toml            # ✅ Cloudflare configuration (USE THIS!)
├── wrangler.toml                # ❌ NOT USED - don't modify this
└── readme/
    └── EMAIL_CLOUDFLARE_DOCUMENTATION.md  # 📖 This file
```

---

## 🔧 **CONFIGURATION** {#configuration}

### **Environment Variables** (wrangler-api.toml)
```toml
[vars]
RESEND_API_KEY = "re_ggeu4gUr_B5wJcjrNv2zUVSTmGu8t7hhN"
ADMIN_EMAIL = "danielsantosomarketing2017@gmail.com"
VILLA_NAME = "Best Villa Bali"
FROM_EMAIL = "danielsantosomarketing2017@gmail.com"
FROM_NAME = "Best Villa Bali"
```

### **Resend Configuration**
| Role | Email Address | Description |
|------|---------------|-------------|
| **1. Email Sender (FROM)** | `Best Villa Bali <onboarding@resend.dev>` | The "from" address for all emails |
| **2. Admin Receiver** | `danielsantosomarketing2017@gmail.com` | Receives booking notifications |
| **3. Customer Email** | `(from booking_data.guest_email)` | Receives booking confirmations |

### **Email Flow Diagram**
```
┌─────────────────────────────────────────────────────────────────┐
│                      EMAIL SENDER (FROM)                        │
│              Best Villa Bali <onboarding@resend.dev>            │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌─────────────────────┐               ┌─────────────────────┐
│  ADMIN RECEIVER     │               │  CUSTOMER EMAIL     │
│  (Admin Notification)│              │  (Booking Confirm)  │
│                     │               │                     │
│  danielsantoso...   │               │  guest_email from   │
│  @gmail.com         │               │  booking_data       │
└─────────────────────┘               └─────────────────────┘
```

### **Current Configuration (wrangler-api.toml)**
```toml
[vars]
RESEND_API_KEY = "re_ggeu4gUr_B5wJcjrNv2zUVSTmGu8t7hhN"
ADMIN_EMAIL = "danielsantosomarketing2017@gmail.com"   # Admin receives notifications here
VILLA_NAME = "Best Villa Bali"                          # Used in email sender name
FROM_EMAIL = "danielsantosomarketing2017@gmail.com"     # (not used - Resend uses onboarding@resend.dev)
```

---

## 🔧 **WHERE TO SETUP ADMIN EMAIL** {#setup-admin-email}

### **Option 1: Via Admin Dashboard API (RECOMMENDED)**

Admin email is now **dynamic** and can be changed via API without redeploying!

#### **Get Current Settings**
```http
GET /api/settings
```
**Response:**
```json
{
  "success": true,
  "data": {
    "admin_email": "danielsantosomarketing2017@gmail.com",
    "villa_name": "Best Villa Bali",
    "from_email": "danielsantosomarketing2017@gmail.com"
  }
}
```

#### **Update Admin Email**
```http
POST /api/settings
Content-Type: application/json

{
  "admin_email": "new-admin@example.com"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Settings updated successfully",
    "settings": {
      "admin_email": "new-admin@example.com",
      "villa_name": "Best Villa Bali",
      "updated_at": "2026-01-09T12:00:00.000Z"
    }
  }
}
```

#### **Update Single Setting**
```http
PUT /api/settings/admin_email
Content-Type: application/json

{
  "value": "new-admin@example.com"
}
```

### **Option 2: Via wrangler-api.toml (Default Fallback)**

If no dynamic setting is saved, the system uses this default:

📁 **File**: `wrangler-api.toml` (line 29)

```toml
[vars]
RESEND_API_KEY = "re_ggeu4gUr_B5wJcjrNv2zUVSTmGu8t7hhN"
ADMIN_EMAIL = "your-admin-email@gmail.com"    # ← Default fallback
VILLA_NAME = "Best Villa Bali"
```

### **Priority Order:**
1. **KV Storage** (set via `/api/settings`) ← Highest priority
2. **Environment Variable** (`wrangler-api.toml`) ← Fallback

### **Where Admin Email is Used:**
| Endpoint | Uses ADMIN_EMAIL For |
|----------|---------------------|
| `/api/email/admin-notification` | Sends booking alerts TO this email |

### **Settings Stored In:**
- **Cloudflare KV**: `CACHE` namespace with key `app_settings`
- **Persistence**: Permanent (no expiration)

### **⚠️ CRITICAL: Correct Config File**
Always deploy using `wrangler-api.toml`:
```bash
npx wrangler deploy --config wrangler-api.toml
```

Do **NOT** use `wrangler.toml` - it points to wrong settings!

---

## 📡 **API ENDPOINTS** {#api-endpoints}

### **Base URL**
```
https://booking-engine-api.danielsantosomarketing2017.workers.dev
```

### **1. Send Booking Confirmation**
```http
POST /api/email/booking-confirmation
Content-Type: application/json

{
  "booking_data": {
    "booking_reference": "BK-12345",
    "guest_name": "John Doe",
    "guest_email": "guest@example.com",
    "check_in": "2025-01-20",
    "check_out": "2025-01-25",
    "guests": 2,
    "room_name": "Luxury Suite",
    "total_amount": "1500.00"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Booking confirmation email sent successfully",
    "recipient": "guest@example.com",
    "booking_reference": "BK-12345",
    "timestamp": "2026-01-09T12:00:00.000Z",
    "email_id": "ff9e37be-0dba-4aa3-b101-6d1ceb16106e",
    "resend_error": null
  }
}
```

### **2. Send Admin Notification**
```http
POST /api/email/admin-notification
Content-Type: application/json

{
  "booking_data": {
    "booking_reference": "BK-12345",
    "guest_name": "John Doe",
    "guest_email": "guest@example.com",
    "check_in": "2025-01-20",
    "check_out": "2025-01-25",
    "guests": 2,
    "room_name": "Luxury Suite",
    "total_amount": "1500.00",
    "guest_phone": "+62812345678"
  }
}
```

### **3. Send Status Change Notification**
```http
POST /api/email/status-change
Content-Type: application/json

{
  "booking_data": {
    "booking_reference": "BK-12345",
    "guest_name": "John Doe",
    "guest_email": "guest@example.com"
  },
  "old_status": "pending",
  "new_status": "confirmed"
}
```

---

## 📧 **EMAIL TEMPLATES** {#email-templates}

### **Booking Confirmation Email**
- **Subject**: `🎉 Booking Confirmation - Best Villa Bali`
- **Sender**: `Best Villa Bali <onboarding@resend.dev>`
- **Content**: 
  - Villa branding header (green theme)
  - Booking reference highlighted
  - Full booking details table
  - Professional footer

### **Admin Notification Email**
- **Subject**: `🔔 New Booking Alert - BK-XXXXX`
- **Sender**: `Best Villa Bali <onboarding@resend.dev>`
- **Content**:
  - Alert header (orange theme)
  - Action required notice
  - Complete booking information
  - Guest contact details

### **Template Location**
Templates are embedded in `src/workers/index.ts`:
- `getBookingConfirmationHtml(booking, env)` - Guest email template
- `getAdminNotificationHtml(booking, env)` - Admin email template

---

## 🧪 **TESTING** {#testing}

### **Test Command (PowerShell)**
```powershell
# Test booking confirmation
Invoke-RestMethod -Uri "https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/email/booking-confirmation" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"booking_data":{"booking_reference":"BK-TEST-001","guest_name":"Test User","guest_email":"danielsantosomarketing2017@gmail.com","check_in":"2025-01-20","check_out":"2025-01-25","guests":2,"room_name":"Luxury Suite","total_amount":"1500.00"}}'
```

### **Test Results**
| Test | Status | Notes |
|------|--------|-------|
| API Response | ✅ Pass | Returns success with email_id |
| Email Delivery | ✅ Pass | Email received in inbox |
| HTML Rendering | ✅ Pass | Professional formatting |
| KV Logging | ✅ Pass | Stored with 30-day TTL |

### **Verified Recipients**
- ✅ `danielsantosomarketing2017@gmail.com` - Works (verified email)

---

## ⚠️ **LIMITATIONS & NOTES** {#limitations}

### **Resend Free Tier Limitations**
| Limitation | Details |
|------------|---------|
| **Recipient Restriction** | Can only send to your verified email (`danielsantosomarketing2017@gmail.com`) |
| **From Address** | Must use `onboarding@resend.dev` until domain verified |
| **Monthly Limit** | 3,000 emails/month |
| **Daily Limit** | 100 emails/day |

### **To Send to Any Email (Production)**
1. Go to [resend.com/domains](https://resend.com/domains)
2. Add your custom domain (e.g., `yourdomain.com`)
3. Verify DNS records (TXT, DKIM, SPF)
4. Update Worker code to use your domain email

### **Example After Domain Verification**
```typescript
// Change from:
from: `${env.VILLA_NAME} <onboarding@resend.dev>`

// To:
from: `${env.VILLA_NAME} <booking@yourdomain.com>`
```

---

## 🔍 **TROUBLESHOOTING** {#troubleshooting}

### **Common Issues**

#### **1. "You can only send testing emails to your own email"**
```json
{
  "resend_error": "{\"statusCode\":403,\"message\":\"You can only send testing emails to your own email address...\"}"
}
```
**Solution**: This is Resend free tier limitation. Either:
- Send only to `danielsantosomarketing2017@gmail.com`
- Verify a custom domain at resend.com/domains

#### **2. "Unknown email action"**
**Solution**: Action must be in URL path, not body:
```
✅ POST /api/email/booking-confirmation
❌ POST /api/email with body { "action": "booking-confirmation" }
```

#### **3. "RESEND_API_KEY not configured"**
**Solution**: Check `wrangler-api.toml` has the key:
```toml
[vars]
RESEND_API_KEY = "re_ggeu4gUr_B5wJcjrNv2zUVSTmGu8t7hhN"
```

#### **4. Changes Not Deploying**
**Solution**: Use correct config file:
```bash
# CORRECT
npx wrangler deploy --config wrangler-api.toml

# WRONG
npx wrangler deploy
```

### **Debug Checklist**
- [ ] Using `wrangler-api.toml` for deploy?
- [ ] RESEND_API_KEY set in environment?
- [ ] Sending to verified email address?
- [ ] Request body has correct structure?
- [ ] Using POST method?

---

## 📋 **PRODUCTION CHECKLIST** {#production-checklist}

### **Before Go-Live**
- [x] ✅ Resend API integrated
- [x] ✅ Email templates working
- [x] ✅ KV logging enabled
- [x] ✅ Test emails successful
- [ ] ⏳ Custom domain verified in Resend (for sending to any email)
- [ ] ⏳ Production domain configured

### **Environment Variables Verified**
- [x] ✅ `RESEND_API_KEY` - Set
- [x] ✅ `ADMIN_EMAIL` - danielsantosomarketing2017@gmail.com
- [x] ✅ `VILLA_NAME` - Best Villa Bali
- [x] ✅ `FROM_EMAIL` - danielsantosomarketing2017@gmail.com

### **Tested Endpoints**
- [x] ✅ `/api/email/booking-confirmation`
- [x] ✅ `/api/email/admin-notification`
- [x] ✅ `/api/email/status-change`

---

## 📊 **COMPARISON: OLD vs NEW**

| Feature | Old (PHPMailer) | New (Resend) |
|---------|-----------------|--------------|
| **Setup Complexity** | Medium | Simple |
| **SMTP Issues** | Common | None |
| **Delivery Speed** | Variable | Fast |
| **Cloudflare Compatible** | ❌ No | ✅ Yes |
| **Free Tier** | Gmail limits | 3,000/month |
| **Scalability** | Limited | Excellent |
| **Error Handling** | Manual | Built-in |

---

## 🔗 **QUICK LINKS**

- **Worker URL**: https://booking-engine-api.danielsantosomarketing2017.workers.dev
- **Resend Dashboard**: https://resend.com/emails
- **Resend Domains**: https://resend.com/domains
- **Cloudflare Dashboard**: https://dash.cloudflare.com

---

**Document Version**: 1.0  
**Platform**: Cloudflare Workers  
**Email Provider**: Resend API  
**Last Tested**: January 9, 2026
