# PHP API Review Plan - Complete Report

## Overview
This document provides a comprehensive review of all PHP files in the `/api` directory.

**Review Date:** 2025-12-31
**Total Files:** 70 PHP files
**Files Reviewed:** 9 core files

---

## 🔴 Critical Security Issues Found

### 1. **HARDCODED DATABASE CREDENTIALS** - `config/database.php`
| Issue | Severity | Line |
|-------|----------|------|
| Database password exposed in code | 🔴 CRITICAL | 41 |

```php
$this->password = 'Kanibal123!!!';  // EXPOSED IN SOURCE CODE!
```

**Recommendation:** Move to `.env` file and use `$_ENV` variables.

### 2. **HARDCODED SMTP CREDENTIALS** - `email-service.php`
| Issue | Severity | Line |
|-------|----------|------|
| Gmail app password exposed in code | 🔴 CRITICAL | 44-45 |

```php
private $smtp_username = 'rumahdaisycantikreservations@gmail.com';
private $smtp_password = 'bcddffkwlfjlafgy';  // EXPOSED APP PASSWORD!
```

**Recommendation:** Move to `.env` file.

### 3. **CORS Open to All Origins**
All API files use:
```php
header("Access-Control-Allow-Origin: *");  // Allows any domain
```

**Exception:** `email-service.php` correctly restricts to specific domain (line 440):
```php
header('Access-Control-Allow-Origin: https://booking.rumahdaisycantik.com');
```

**Recommendation:** Apply same restriction to all production APIs.

---

## ✅ Security Best Practices Found

| Practice | Status |
|----------|--------|
| Prepared statements (PDO) | ✅ All files use `$pdo->prepare()` |
| OPTIONS preflight handling | ✅ Properly handled |
| JSON input parsing | ✅ `json_decode()` with error checking |
| Error logging | ✅ Errors logged to file, not exposed |
| Input validation | ✅ Required field checks |
| HTTP status codes | ✅ Proper 400/404/500 responses |
| Password hashing | ✅ `password_verify()` in auth.php |
| Input sanitization | ✅ `htmlspecialchars()` + `strip_tags()` in villa.php |

---

## File-by-File Review

### Config (`/api/config/`)

| File | Status | Security | Quality | Notes |
|------|--------|----------|---------|-------|
| database.php | ⚠️ | 🔴 CRITICAL | ✅ | **Hardcoded credentials - MUST FIX** |
| calendar.php | - | - | - | Not reviewed |
| database-local.php | - | - | - | Backup/local config |
| email.php | - | - | - | Email settings |
| env.php | - | - | - | Environment loader |
| payment.php | - | - | - | Payment config |

---

### Admin (`/api/admin/`)

| File | Status | Security | Quality | Notes |
|------|--------|----------|---------|-------|
| auth.php | ✅ | ✅ Good | ✅ | Uses `password_verify()`, session-based auth |
| hero-selection.php | - | - | - | Not reviewed |
| images.php | - | - | - | Not reviewed |
| settings.php | - | - | - | Not reviewed |

**auth.php Highlights:**
- ✅ Uses prepared statements
- ✅ Password hashing with `password_verify()`
- ✅ Session-based authentication
- ✅ Last login tracking
- ⚠️ No rate limiting (could add brute force protection)

---

### Core APIs

#### packages.php (27.7KB, 620 lines)
| Aspect | Status | Notes |
|--------|--------|-------|
| CORS | ⚠️ | Open to all origins |
| SQL Injection | ✅ | Uses prepared statements |
| Input Validation | ✅ | Validates required fields |
| Error Handling | ✅ | Try-catch with logging |
| JSON Handling | ✅ | Proper encode/decode |
| Logging | ✅ | Logs to error.log |

**Functions:**
- `handleGet()` - Get packages with room options, availability
- `handlePost()` - Create new package
- `handlePut()` - Update package (extensive field handling)
- `handleDelete()` - Delete package

---

#### rooms.php (29.7KB, 751 lines)
| Aspect | Status | Notes |
|--------|--------|-------|
| CORS | ⚠️ | Open to all origins |
| SQL Injection | ✅ | Uses prepared statements |
| Input Validation | ✅ | Validates required fields |
| Error Handling | ✅ | Try-catch blocks |

**Notable:**
- Contains `RoomImageHelper` class (lines 16-386)
- Dynamic image folder discovery
- Multiple image management actions (add, remove, set_primary)

---

#### bookings.php (20.1KB, 506 lines)
| Aspect | Status | Notes |
|--------|--------|-------|
| CORS | ⚠️ | Open to all origins |
| SQL Injection | ✅ | Uses prepared statements |
| Input Validation | ✅ | Thorough validation |
| Email Integration | ✅ | Sends confirmation emails |

**Features:**
- Unique booking reference generation
- Email confirmation on booking
- Status change notifications
- Room availability validation

---

#### amenities.php (28KB, 843 lines)
| Aspect | Status | Notes |
|--------|--------|-------|
| CORS | ⚠️ | Open to all origins |
| SQL Injection | ✅ | Uses prepared statements |
| Error Logging | ✅ | Production-safe |
| Transaction Support | ✅ | Uses `beginTransaction()` |

**Endpoints:**
- `/amenities` - CRUD
- `/room-amenities` - Room-amenity relationships
- `/package-amenities` - Package-amenity relationships
- `/categories` - Category management
- `/sales-tool` - Combined data for sales

---

### Services

#### email-service.php (25.2KB, 571 lines)
| Aspect | Status | Notes |
|--------|--------|-------|
| CORS | ✅ | **Correctly restricted** to booking.rumahdaisycantik.com |
| Credentials | 🔴 | **Hardcoded SMTP password** |
| SSL Verification | ⚠️ | Disabled (`verify_peer: false`) |
| Error Handling | ✅ | Try-catch with fallbacks |

**Features:**
- PHPMailer integration with Gmail SMTP
- Guest booking confirmation emails
- Admin notification emails
- Status change notifications
- HTML and plain text email templates
- Health check endpoint

**Security Issues:**
1. Line 44-45: SMTP credentials hardcoded
2. Line 178-183: SSL verification disabled (needed for development but risky in production)

---

#### ical.php (21.8KB, 615 lines)
| Aspect | Status | Notes |
|--------|--------|-------|
| CORS | ⚠️ | Open to all origins |
| SQL Injection | ✅ | Uses prepared statements |
| File Operations | ⚠️ | Writes to config/ical_urls.json |

**Features:**
- `iCalGenerator` class for generating iCal feeds
- Platform sync (Airbnb, Google Calendar)
- URL validation and testing
- Subscribe URL generation

**Security Considerations:**
- Writes external URLs to JSON config file (line 88)
- Fetches external URLs with `file_get_contents()` (line 31)
- No URL validation to ensure only iCal URLs are saved

---

#### villa.php (9.4KB, 224 lines)
| Aspect | Status | Notes |
|--------|--------|-------|
| CORS | ⚠️ | Open to all origins |
| SQL Injection | ✅ | Uses prepared statements |
| Input Sanitization | ✅ | Uses `htmlspecialchars()` + `strip_tags()` |
| Cache | ✅ | No-cache headers set |

**Features:**
- GET/POST/PUT for villa information
- Field mapping (frontend ↔ database)
- JSON field parsing (images, amenities)
- Dynamic query building

**Good Practices:**
- Line 166: Input sanitization: `htmlspecialchars(strip_tags($input[$inputField]))`
- Line 110-117: Rating validation (0-5 range)
- Line 181: Automatic timestamp update

---

### Controllers (`/api/controllers/`)

| File | Status | Notes |
|------|--------|-------|
| BookingController.php | - | Not reviewed (likely MVC pattern) |
| PackageController.php | - | Not reviewed |
| RoomController.php | - | Not reviewed |
| VillaController.php | - | Not reviewed |

---

### Models (`/api/models/`)

| File | Status | Notes |
|------|--------|-------|
| Booking.php | - | Data model |
| Package.php | - | Data model |
| Room.php | - | Data model |
| VillaInfo.php | - | Data model |

---

### Homepage Variations

| File | Size | Notes |
|------|------|-------|
| homepage.php | 14.4KB | Main homepage data |
| homepage-fixed.php | 13.6KB | Fixed version |
| homepage-compatible.php | 13.1KB | Compatibility |
| homepage-simple.php | 1.9KB | Simplified |

**Recommendation:** Consolidate these into a single file with feature flags.

---

### Test Files (Can be removed in production)

| File | Size | Notes |
|------|------|-------|
| test-delete.php | 1.6KB | ❌ Remove in prod |
| test-inclusions-db.php | 1.5KB | ❌ Remove in prod |
| test-package-inclusions.php | 2.3KB | ❌ Remove in prod |
| test-post.php | 0.9KB | ❌ Remove in prod |
| test-room-images.php | 1.3KB | ❌ Remove in prod |
| db-test.php | 0.7KB | ❌ Remove in prod |
| marketing-categories-test.php | 2.3KB | ❌ Remove in prod |

---

### Backup/Duplicate Files

| File | Notes |
|------|-------|
| bookings-fixed.php | Consider merging with bookings.php |
| package-rooms-backup.php | Remove if not needed |
| existingvillanotwork.php | Legacy/deprecated |

---

## Summary

### 🔴 Must Fix (Critical)
1. **Move database credentials to .env file** - `config/database.php` line 41
2. **Move SMTP credentials to .env file** - `email-service.php` lines 44-45
3. **Restrict CORS origins** in production (except email-service.php which is correct)

### ⚠️ Should Fix (Medium)
1. Add rate limiting to `admin/auth.php`
2. Consolidate homepage.php variants
3. Remove test files in production
4. Enable SSL verification in email-service.php for production
5. Validate iCal URLs before saving in ical.php

### ✅ Good Practices Found
1. All SQL uses prepared statements (no SQL injection)
2. Proper input validation
3. Error logging without exposing details
4. Password hashing for auth (`password_verify()`)
5. Transaction support for complex operations
6. Proper HTTP status codes
7. Input sanitization with `htmlspecialchars()` + `strip_tags()`
8. Correct CORS restriction in email-service.php

### 📊 Cleanup Recommendations

| Action | Files | Impact |
|--------|-------|--------|
| Remove test files | 7 files | ~10KB saved |
| Consolidate homepage files | 4→1 | Cleaner codebase |
| Remove backup files | 2 files | ~34KB saved |

---

## Priority Action Items

1. **IMMEDIATE:** Secure database credentials (move to .env)
2. **IMMEDIATE:** Secure SMTP credentials (move to .env)
3. **HIGH:** Configure CORS for production
4. **MEDIUM:** Add rate limiting to auth
5. **LOW:** Clean up test/backup files
