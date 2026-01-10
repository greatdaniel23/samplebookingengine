# Cloudflare Connection Setup Guide

## Step 1: Install Wrangler CLI

Run this command in your terminal:

```bash
npm install -D wrangler
```

## Step 2: Authenticate with Cloudflare

```bash
npx wrangler login
```

This will:
- Open your browser to Cloudflare
- Ask you to authorize the Wrangler CLI
- Save your authentication token locally

## Step 3: Create Cloudflare D1 Database

Create your D1 database:

```bash
npx wrangler d1 create booking-engine
```

This will output:
```
✅ Successfully created D1 database 'booking-engine'

Add the following to your wrangler.toml:
[[d1_databases]]
binding = "DB"
database_name = "booking-engine"
database_id = "YOUR_DATABASE_ID"
```

**⚠️ Copy the `database_id` and paste it into `wrangler.toml` replacing `YOUR_DATABASE_ID`**

## Step 4: Create KV Namespace (for sessions)

```bash
npx wrangler kv:namespace create "SESSIONS"
```

Copy the namespace ID and update `wrangler.toml`.

For cache:
```bash
npx wrangler kv:namespace create "CACHE"
```

## Step 5: Create R2 Bucket (for images)

```bash
npx wrangler r2 bucket create booking-engine-images
```

## Step 6: Verify Setup

Test the connection:

```bash
npx wrangler whoami
```

This should show your Cloudflare account email.

## Next Steps

After completing these steps:
1. Export your Hostinger MySQL database
2. Convert schema to SQLite (D1 compatible)
3. Create Workers for API endpoints
4. Deploy frontend to Pages

---

**Troubleshooting:**
- If login fails: Make sure you have a Cloudflare account at https://dash.cloudflare.com
- If commands don't work: Update wrangler: `npm install -g wrangler@latest`
- Check CLI version: `npx wrangler --version`
