# Production Deployment Checklist

## Pre-Deployment (1 week before)

### Planning & Communication
- [ ] Schedule deployment window
- [ ] Notify stakeholders
- [ ] Create rollback plan document
- [ ] Brief support team
- [ ] Prepare communication templates
- [ ] Document known issues

### Code Review & Testing
- [ ] All pull requests reviewed and merged
- [ ] All tests passing (unit, integration, e2e)
- [ ] Performance benchmarks acceptable
- [ ] Security scan completed (OWASP)
- [ ] Dependencies audit passed
- [ ] TypeScript strict mode enabled
- [ ] No console warnings or errors
- [ ] Linting passed (ESLint, Prettier)

### Database Preparation
- [ ] Database schema migrations prepared
- [ ] Backup strategy documented
- [ ] Data migration tested on staging
- [ ] Rollback queries prepared
- [ ] Performance tests on production-sized data
- [ ] Indexes optimized
- [ ] Query performance verified

### Infrastructure Review
- [ ] Cloudflare configuration verified
- [ ] D1 database backups enabled
- [ ] R2 bucket lifecycle policies set
- [ ] KV namespace backups enabled
- [ ] Rate limiting configured
- [ ] DDoS protection enabled
- [ ] SSL/TLS certificates valid
- [ ] DNS records correct

### Documentation
- [ ] API documentation updated
- [ ] Deployment runbook created
- [ ] Architecture diagrams updated
- [ ] Configuration documented
- [ ] Environment variables documented
- [ ] Troubleshooting guide prepared
- [ ] Runbook accessible to all team members

### Monitoring Setup
- [ ] Sentry/error tracking configured
- [ ] UptimeRobot monitoring enabled
- [ ] Cloudflare Analytics dashboard created
- [ ] Alert thresholds configured
- [ ] On-call rotation established
- [ ] Incident response plan documented
- [ ] Status page configured

## 1 Day Before Deployment

### Final Checks
- [ ] Tag release in Git: `git tag -a v1.0.0 -m "Production release"`
- [ ] Create release notes
- [ ] Verify all environment variables
- [ ] Test database backup/restore
- [ ] Verify R2 bucket contents
- [ ] Check KV namespace status
- [ ] Verify email service credentials
- [ ] Test payment processor (if integrated)

### Staging Verification
- [ ] Deploy to staging environment
- [ ] Run full test suite on staging
- [ ] Perform smoke tests
- [ ] Load test on staging
- [ ] Verify all endpoints
- [ ] Check error handling
- [ ] Verify email notifications
- [ ] Test admin dashboard

### Team Preparation
- [ ] Confirm all team members available
- [ ] Distribute deployment runbook
- [ ] Conduct deployment dry run
- [ ] Share incident response procedures
- [ ] Verify communication channels
- [ ] Test alert notifications
- [ ] Brief QA team

## Deployment Day

### 1. Pre-Deployment Window (30 minutes before)

```bash
# 1. Create backup of current deployment
git tag backup-before-$(date +%Y%m%d-%H%M%S)

# 2. Verify current state
npx wrangler tail --config wrangler-api.toml --lines=10

# 3. Check all systems
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/health

# 4. Ensure database is healthy
npx wrangler d1 execute booking-engine --command "SELECT COUNT(*) FROM bookings"

# 5. Verify R2 connectivity
npx wrangler r2 object list imageroom --limit 5
```

### 2. Execute Deployment (During maintenance window)

**Step 1: Database Preparation**
```bash
# 1. Create database snapshot
npx wrangler d1 execute booking-engine --command "PRAGMA integrity_check"

# 2. Run pre-deployment queries if needed
npx wrangler d1 execute booking-engine --file=database/pre-deployment.sql --remote

# 3. Verify data integrity
npx wrangler d1 execute booking-engine --command "SELECT COUNT(*) FROM bookings"
```

**Step 2: Worker Deployment**
```bash
# 1. Build application
npm run build

# 2. Deploy Worker
npx wrangler deploy --config wrangler-api.toml

# 3. Verify deployment
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/health
```

**Step 3: Frontend Deployment (if using Cloudflare Pages)**
```bash
# Deploy updated frontend
npm run build:frontend

# Optional: manual deployment
wrangler pages deploy dist/
```

**Step 4: Post-Deployment Verification**
```bash
# 1. Check API health
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/health

# 2. Test all critical endpoints
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/bookings/list
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/amenities/list
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/admin/dashboard

# 3. Check error logs
npx wrangler tail --config wrangler-api.toml --status ok,error

# 4. Verify database
npx wrangler d1 execute booking-engine --command "SELECT COUNT(*) FROM bookings; SELECT COUNT(*) FROM amenities;"

# 5. Check R2 connectivity
npx wrangler r2 object list imageroom --limit 1
```

### 3. Smoke Tests (Immediately after deployment)

```bash
# Test booking creation
curl -X POST https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "booking_reference": "TEST-001",
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "check_in": "2024-12-25",
    "check_out": "2024-12-26",
    "guests": 2,
    "total_price": 100
  }'

# Test authentication
curl -X POST https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Test admin dashboard
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/admin/dashboard
```

### 4. Monitoring (First 30 minutes)

- [ ] Monitor error rate in Cloudflare Analytics
- [ ] Check Sentry for errors
- [ ] Monitor database performance
- [ ] Check API response times
- [ ] Monitor CPU and memory usage
- [ ] Check for any failed requests
- [ ] Verify all endpoints responding
- [ ] Monitor backend logs for errors

```bash
# Watch real-time logs
npx wrangler tail --config wrangler-api.toml --follow
```

## Post-Deployment (First 24 hours)

### Immediate Actions (1-4 hours)
- [ ] Monitor all metrics closely
- [ ] Check error rates
- [ ] Verify functionality with users
- [ ] Monitor performance graphs
- [ ] Review application logs
- [ ] Check third-party service integrations
- [ ] Verify email notifications
- [ ] Test payment processing (if applicable)

### First Day Actions
- [ ] Collect user feedback
- [ ] Verify all features working
- [ ] Monitor database growth
- [ ] Check backup completion
- [ ] Review security logs
- [ ] Update status page
- [ ] Send deployment notification
- [ ] Update documentation

### First Week Actions
- [ ] Monitor error trends
- [ ] Check performance metrics
- [ ] Verify backup integrity
- [ ] Review user feedback
- [ ] Plan improvements
- [ ] Update runbooks based on learnings
- [ ] Optimize based on metrics
- [ ] Create post-deployment report

## Rollback Plan

### If Critical Issue Detected

**Immediate Actions:**
```bash
# 1. Identify the issue
# Check logs for specific errors
npx wrangler tail --config wrangler-api.toml --status error

# 2. Get previous deployment version
wrangler deployments list

# 3. Rollback to previous version
git checkout <previous-commit-hash>

# 4. Deploy previous version
npx wrangler deploy --config wrangler-api.toml

# 5. Verify rollback
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/health
```

**Database Rollback (if needed):**
```bash
# 1. Restore from backup
npx wrangler d1 execute booking-engine --file=database/backup-latest.sql --remote

# 2. Verify data integrity
npx wrangler d1 execute booking-engine --command "SELECT COUNT(*) FROM bookings"

# 3. Verify application
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/bookings/list
```

### Communication
- [ ] Notify all stakeholders
- [ ] Update status page
- [ ] Document issue in incident report
- [ ] Schedule post-mortem
- [ ] Identify root cause
- [ ] Implement fixes
- [ ] Plan re-deployment

## Post-Deployment Report

### Metrics to Collect
- Deployment start time: ___________
- Deployment end time: ___________
- Downtime: ___________
- Rollback required: Yes / No
- Issues encountered: ___________

### Performance Metrics
- API response time: _____ ms
- Database query time: _____ ms
- Error rate: _____ %
- Uptime: _____ %

### Team Feedback
- Deployment smoothness: 1-5
- Documentation clarity: 1-5
- Communication effectiveness: 1-5
- Issues: _____________________

## Maintenance Windows

### Scheduled Maintenance
- Frequency: Monthly (first Sunday, 2-4 AM UTC)
- Notification: 72 hours in advance
- Expected downtime: < 15 minutes
- Maintenance types: Database optimization, security updates

### Emergency Maintenance
- Notification: ASAP
- Expected downtime: Variable
- Rollback plan: Always available

## Version Control

### Release Tagging
```bash
# Create release tag
git tag -a v1.0.0 -m "Production release - Features: A, B, C"

# Push tag
git push origin v1.0.0

# Verify tag
git show v1.0.0
```

## Documentation Links

- API Reference: [WORKER_API_REFERENCE.md](./WORKER_API_REFERENCE.md)
- Frontend Integration: [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)
- Testing Guide: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- Architecture: [MIGRATION_TO_CLOUDFLARE.md](./MIGRATION_TO_CLOUDFLARE.md)

## Emergency Contacts

- On-Call Engineer: ________________
- Backend Lead: ________________
- DevOps Lead: ________________
- Product Manager: ________________
- Support Lead: ________________

## Post-Deployment Success Criteria

- [ ] All endpoints responding with status 200
- [ ] Error rate < 0.1%
- [ ] API response time < 100ms
- [ ] Database queries < 50ms
- [ ] No security alerts
- [ ] All integrations working
- [ ] Automated tests passing
- [ ] User reports: No critical issues
- [ ] Performance within baseline
- [ ] System stable for 24 hours

## Sign-Off

- Deployment Lead: _______________ Date: ___
- Engineering Manager: _______________ Date: ___
- Product Manager: _______________ Date: ___
- QA Lead: _______________ Date: ___
