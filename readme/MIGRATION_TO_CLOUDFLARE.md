# Migration Plan: Hostinger (JS+PHP) → Cloudflare (Pages + Workers + D1)

**Status:** Planning Phase  
**Last Updated:** January 8, 2026  
**Target Platform:** Cloudflare Pages + Cloudflare Workers + Cloudflare D1

---

## 📋 Executive Summary

This document outlines the complete migration strategy for the Frontend Booking Engine from a traditional Hostinger-based PHP+JavaScript stack to a serverless architecture using Cloudflare Pages, Cloudflare Workers, and Cloudflare D1 database.

---

## 🏗️ Current Architecture

### **Stack**
- **Frontend:** JavaScript/TypeScript (Vite)
- **Backend:** PHP scripts (Traditional server-based)
- **Hosting:** Hostinger
- **Database:** MySQL/MariaDB (Server-hosted)
- **Server Language:** PHP

### **Key Components**
- Admin Dashboard (`admin/`)
- API Layer (`api/`)
- Database Layer (`database/`)
- Email Templates (`email-templates/`)
- Frontend Source (`src/`)
- Image Management (`image/`)

### **Current Dependencies**
- PHP runtime environment
- MySQL database server
- Server-side session management
- Traditional file uploads and storage

---

## 🎯 Target Architecture

### **Cloudflare Stack**
- **Frontend Hosting:** Cloudflare Pages (static assets + edge functions)
- **Backend API:** Cloudflare Workers (serverless functions)
- **Database:** Cloudflare D1 (SQLite-based, edge-optimized)
- **Image Storage:** Cloudflare R2 (object storage) or Cloudflare Images
- **Authentication:** Cloudflare Access / JWT-based
- **Email Service:** Integration with external service (SendGrid, Mailgun, Resend)

### **Key Benefits**
✅ Global edge distribution  
✅ Zero cold starts (Workers)  
✅ Automatic scaling  
✅ DDoS protection  
✅ Reduced latency  
✅ Pay-as-you-go pricing  

---

## 📂 Migration Phases

### **Phase 1: Preparation & Setup** (Week 1-2)

#### 1.1 Environment Setup
- [ ] Create Cloudflare account (if not exists)
- [ ] Install Cloudflare CLI (`wrangler`)
- [ ] Create Cloudflare D1 database
- [ ] Set up R2 bucket for images
- [ ] Configure environment variables

#### 1.2 Database Migration
- [ ] Export MySQL schema to SQL
- [ ] Convert MySQL to SQLite schema (D1 compatible)
- [ ] Export data from MySQL
- [ ] Validate schema compatibility
- [ ] Load data into D1
- [ ] Test database connectivity

**Files to Create:**
```
database/
  d1-schema.sql          (SQLite schema)
  migration-script.js    (Data migration helper)
  rollback-plan.sql
```

#### 1.3 Code Analysis & Planning
- [ ] Audit all PHP files for logic extraction
- [ ] Identify database queries to convert to JavaScript/SQL
- [ ] Plan session management strategy (use cookies/JWT instead)
- [ ] List all external API integrations
- [ ] Document file upload processes

---

### **Phase 2: Backend Migration** (Week 3-5)

#### 2.1 Convert PHP to Cloudflare Workers

**API Endpoints to Migrate:**

**Booking System:**
- [ ] `api/bookings.php` → `src/workers/bookings.js`
- [ ] `api/bookings-fixed.php` → refactor logic
- [ ] `api/package-rooms.php` → `src/workers/packages.js`

**Villa & Room Management:**
- [ ] `api/villa.php` → `src/workers/villa.js`
- [ ] `api/rooms.php` → `src/workers/rooms.js`
- [ ] `api/amenities.php` → `src/workers/amenities.js`
- [ ] `api/inclusions.php` → `src/workers/inclusions.js`

**Images & Media:**
- [ ] `api/images.php` → `src/workers/images.js` (integrate R2)
- [ ] `api/hero-images.php` → `src/workers/hero-images.js`
- [ ] `api/room-images.php` → `src/workers/room-images.js`

**Calendar & iCal:**
- [ ] `api/ical.php` → `src/workers/ical.js`
- [ ] `api/ical_import_airbnb.php` → `src/workers/ical-import.js`
- [ ] `api/ical_proxy.php` → `src/workers/ical-proxy.js`

**Payments:**
- [ ] `api/payment/*` → `src/workers/payment.js`
- [ ] Integrate payment gateway (Stripe/PayPal via Workers)

**Admin & Auth:**
- [ ] `api/admin/*` → `src/workers/admin.js`
- [ ] Convert `admin-auth-guard.js` to Worker authentication

**Notifications:**
- [ ] `api/notify.php` → `src/workers/notify.js`
- [ ] `api/email-service.php` → integrate external email service

**Utility Endpoints:**
- [ ] `api/health.php` → `src/workers/health.js`
- [ ] Marketing categories, health checks

#### 2.2 Database Access Layer
- [ ] Create D1 query wrapper functions
- [ ] Set up connection pooling strategy
- [ ] Implement error handling for database operations
- [ ] Create database helper utilities

**New Files:**
```
src/workers/
  lib/
    db.js              (D1 connection & queries)
    auth.js            (JWT/Cookie authentication)
    validation.js      (Input validation)
    response.js        (Standardized API responses)
    errors.js          (Error handling)
```

#### 2.3 Authentication Migration
- [ ] Replace PHP session management with JWT tokens
- [ ] Implement secure cookie storage
- [ ] Set up admin authentication in Workers
- [ ] Create token refresh mechanism
- [ ] Implement CORS properly for edge

---

### **Phase 3: Frontend Migration** (Week 5-6)

#### 3.1 Update API Calls
- [ ] Update all fetch/axios calls to point to Worker endpoints
- [ ] Change authentication from session-based to JWT
- [ ] Update error handling for new API format
- [ ] Test all API integrations

#### 3.2 Asset Optimization
- [ ] Ensure images use Cloudflare Images or R2 URLs
- [ ] Optimize static assets for Cloudflare Pages
- [ ] Update image paths in configuration

**Files to Update:**
```
src/
  config.ts           (API endpoints)
  services/          (API client updates)
  components/        (Image handling)
  App.tsx            (Authentication flow)
```

#### 3.3 Build & Deploy Configuration
- [ ] Create `wrangler.toml` configuration
- [ ] Set up `wrangler.json` for D1
- [ ] Update `vite.config.ts` for Pages deployment
- [ ] Create build scripts for Cloudflare

**New Files:**
```
wrangler.toml         (Workers & D1 config)
.env.example          (Environment template)
scripts/
  deploy.sh           (Deployment script)
  db-migrate.js       (Database migration runner)
```

---

### **Phase 4: Image & File Handling** (Week 6)

#### 4.1 Image Migration to R2/Cloudflare Images
- [ ] Export current images from `public/images/`
- [ ] Set up R2 bucket
- [ ] Upload existing images to R2
- [ ] Create image upload/resize Worker
- [ ] Update image URLs across application

#### 4.2 File Upload Handling
- [ ] Convert `api/upload.php` to Worker endpoint
- [ ] Use multipart form handling in Workers
- [ ] Implement validation in Worker
- [ ] Store files in R2 directly

**New Worker:**
```
src/workers/upload.js
  - Handle multipart uploads
  - Validate file types/sizes
  - Store in R2
  - Return CDN URLs
```

---

### **Phase 5: Email Service Migration** (Week 7)

#### 5.1 Replace PHP Email with External Service
- [ ] Choose email provider (SendGrid, Mailgun, Resend, AWS SES)
- [ ] Create Worker endpoint for sending emails
- [ ] Migrate email templates from HTML files
- [ ] Implement email validation and queuing
- [ ] Add retry logic

**New Files:**
```
src/workers/email.js
  - Email sending logic
  - Template rendering
  - Error handling
  - Retry mechanism
```

---

### **Phase 6: Testing & Validation** (Week 7-8)

#### 6.1 Unit Tests
- [ ] Test all Worker endpoints
- [ ] Test database queries
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Test email sending

#### 6.2 Integration Tests
- [ ] End-to-end booking flow
- [ ] Admin dashboard operations
- [ ] Image upload and retrieval
- [ ] Payment processing
- [ ] Email notifications

#### 6.3 Performance Testing
- [ ] Load testing with Cloudflare Analytics
- [ ] Latency measurements
- [ ] Database query optimization
- [ ] Image delivery optimization

#### 6.4 Security Testing
- [ ] CORS configuration
- [ ] Authentication/Authorization
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection

---

### **Phase 7: Deployment & Migration** (Week 8-9)

#### 7.1 Pre-Launch
- [ ] Set up domain DNS with Cloudflare nameservers
- [ ] Configure SSL/TLS settings
- [ ] Set up monitoring and logging
- [ ] Create backup strategy
- [ ] Document rollback plan

#### 7.2 Gradual Rollout
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Deploy to production with traffic split
- [ ] Monitor error rates and performance
- [ ] Complete migration of remaining traffic

#### 7.3 Post-Launch
- [ ] Monitor application metrics
- [ ] Fix issues reported by users
- [ ] Optimize based on actual usage patterns
- [ ] Clean up old Hostinger resources

---

## 🔧 Technology Mapping

| Current (Hostinger) | Target (Cloudflare) | Implementation |
|---|---|---|
| PHP Scripts | Cloudflare Workers | JavaScript/TypeScript |
| MySQL Database | Cloudflare D1 | SQLite with D1 bindings |
| File Storage | R2 / Cloudflare Images | Object storage API |
| Sessions | JWT Tokens | Cookie-based tokens |
| Email | mail() function | External API (SendGrid, etc.) |
| CDN | Basic hosting | Cloudflare Pages + Edge |
| Analytics | Server logs | Cloudflare Analytics Engine |

---

## 📦 Dependencies & Tools

### **New Dependencies**
```json
{
  "devDependencies": {
    "wrangler": "^3.x",
    "miniflare": "^2.x"
  },
  "dependencies": {
    "@cloudflare/workers-types": "^4.x",
    "d1-connector": "custom wrapper"
  }
}
```

### **CLI Tools**
- Cloudflare Wrangler (Worker development)
- Cloudflare CLI for configuration
- Local D1 testing environment

---

## 🚨 Potential Challenges & Solutions

### **Challenge 1: Database Migration (MySQL → SQLite/D1)**
**Issue:** MySQL and SQLite have syntax differences  
**Solution:**
- Use migration script to convert schema
- Test with sample data before full migration
- Maintain backward compatibility where possible

### **Challenge 2: Session Management**
**Issue:** PHP sessions won't work in serverless  
**Solution:**
- Implement JWT-based authentication
- Store tokens in secure cookies
- Use refresh tokens for long sessions

### **Challenge 3: File Uploads**
**Issue:** No persistent server filesystem  
**Solution:**
- Use R2 for permanent storage
- Stream uploads directly to R2
- Implement proper validation

### **Challenge 4: Email Functionality**
**Issue:** Can't use PHP mail()  
**Solution:**
- Integrate external email service API
- Queue emails for reliability
- Add retry logic

### **Challenge 5: Performance Optimization**
**Issue:** D1 queries might be slower than direct MySQL  
**Solution:**
- Implement caching with KV store
- Optimize database indexes
- Use pagination for large datasets
- Consider query batching

### **Challenge 6: Image Optimization**
**Issue:** Complex image processing needs**  
**Solution:**
- Use Cloudflare Image optimization
- Pre-generate thumbnails
- Implement lazy loading on frontend
- Use WebP format where possible

---

## 📊 Migration Checklist

### **Pre-Migration**
- [ ] Database backup created
- [ ] Current system documented
- [ ] Team trained on Cloudflare
- [ ] Testing environment ready
- [ ] Rollback plan documented

### **During Migration**
- [ ] All endpoints converted
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audits completed
- [ ] DNS configured

### **Post-Migration**
- [ ] All services functioning
- [ ] Monitoring active
- [ ] Performance baseline established
- [ ] Team documentation updated
- [ ] Legacy system decommissioned

---

## 💰 Cost Estimation

### **Hostinger (Monthly)**
- Shared hosting: ~$5-10/month
- Database included
- Email: included

### **Cloudflare (Monthly Estimate)**
- Pages: Free tier (generous)
- Workers: $0.50/million requests (after free tier)
- D1: $0.75/million reads + writes
- R2: $0.015/GB stored + $0.20/million requests
- **Estimated Total:** $5-20/month (depending on traffic)

---

## 📝 Implementation Order

1. **Database:** Create D1, migrate schema and data
2. **Core APIs:** Migrate booking, villa, rooms endpoints
3. **Authentication:** Set up JWT-based auth
4. **Images:** Set up R2, migrate images
5. **Email:** Set up external email service
6. **Frontend:** Update API calls
7. **Testing:** Comprehensive testing
8. **Deployment:** Gradual rollout
9. **Monitoring:** Set up alerts and dashboards

---

## 🔗 Resources & Documentation

### **Cloudflare Documentation**
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [R2 Object Storage](https://developers.cloudflare.com/r2/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### **Related Documentation**
- Current setup: [ADMIN_DASHBOARD_COMPLETE_DOCUMENTATION.md](./ADMIN_DASHBOARD_COMPLETE_DOCUMENTATION.md)
- Admin guide: [admin-dashboard-checklist.md](./admin-dashboard-checklist.md)

---

## 👥 Team Responsibilities

- **DevOps:** Cloudflare setup, DNS, monitoring
- **Backend:** Worker development, D1 optimization
- **Frontend:** API integration, asset optimization
- **QA:** Testing, performance validation
- **Project Manager:** Timeline tracking, stakeholder communication

---

## 📞 Support & Questions

For questions about this migration:
1. Review Cloudflare documentation
2. Check worker examples in `src/workers/`
3. Consult D1 query helpers in `src/workers/lib/`
4. Review test files in `tests/`

---

**Last Updated:** January 8, 2026  
**Version:** 1.0 - Initial Planning  
**Next Review:** Upon completion of Phase 1

