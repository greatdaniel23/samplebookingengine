# 🗄️ Database-Backed Calendar Strategy
**Villa Booking Engine – Design Rationale, Pros, Cons & Operational Guidance**

Last Updated: 2025-11-14

---
## 1. Purpose
Centralize all availability intelligence (internal bookings + imported external blocks) inside our database so every booking decision is consistent, auditable, and easy to evolve.

---
## 2. Scope
Included:
- Internal bookings (source of truth)
- External imported ranges (Airbnb now; Booking.com/VRBO later)
- Availability enforcement logic
- Indexing, retention, monitoring, security
Out of scope (future): dynamic pricing, full channel manager abstraction, real-time webhooks.

---
## 3. Data Model Summary
| Element | Table | Notes |
|---------|-------|-------|
| Internal booking | `bookings` | Existing schema; check_in/check_out (DATE) pair, status-driven |
| External block/reservation | `external_blocks` | start_date inclusive, end_date exclusive; source + uid unique |
| Derived availability | (no table) | Computed at query time (join / union logic) |
| Calendar export feed | Rendered | Generated via `iCalGenerator` from bookings only (external blocks are not exported outward) |

`external_blocks` simplified definition:
```sql
CREATE TABLE external_blocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(50) NOT NULL,         -- 'airbnb', 'booking_com', 'vrbo'
  uid VARCHAR(255) NOT NULL,            -- ICS UID or generated hash
  start_date DATE NOT NULL,             -- Inclusive start
  end_date DATE NOT NULL,               -- Exclusive end (DTEND semantics)
  summary TEXT NULL,                    -- "Not available" or guest name
  description TEXT NULL,                -- Raw description if available
  last_seen DATETIME NOT NULL,          -- Upsert timestamp
  raw_event JSON NULL,                  -- Original parsed key-values
  UNIQUE KEY uniq_source_uid (source, uid),
  KEY idx_source_range (source, start_date, end_date)
);
```

---
## 4. Why a Database Approach?
### Pros
1. Single source of truth for availability decisions
2. ACID consistency (avoid race conditions vs in-memory caches)
3. Historical audit of external imports (debugging disputes)
4. Easier multi-channel scaling (just add rows; no redesign)
5. Query-based flexibility (complex reporting / occupancy analytics)
6. Deterministic overlap rejection (SQL predicate uniformity)
7. Enables incremental enhancements (archival, tagging, segmentation)

### Cons / Trade-offs
1. Additional writes on every import cycle (I/O overhead)
2. Requires pruning strategy to avoid table bloat over years
3. Slight increase in booking confirmation latency (extra overlap query)
4. Need schema evolution when adding richer external metadata
5. Potential duplication risk if UID logic flawed (mitigated via unique index)

### Alternatives Considered
| Alternative | Issues |
|-------------|--------|
| In-memory cache (Redis only) | Loses audit trail; harder recovery after restart |
| Third-party channel manager | Cost, vendor lock-in, less customization |
| Flat file storage (JSON per source) | Hard concurrent update & indexing; poor scaling |

Decision: A normalized SQL table gives balanced performance + flexibility.

---
## 5. Overlap Logic (Core Contract)
Inputs:
- requested_start (DATE)
- requested_end (DATE) – exclusive check-out
Success Criteria:
- Booking allowed if NO internal booking overlap AND NO external block overlap.

Predicate (simplified):
```sql
-- Internal booking overlap (status considered)
SELECT 1 FROM bookings
WHERE status IN ('confirmed','pending')
  AND :requested_start < check_out
  AND :requested_end   > check_in
LIMIT 1;

-- External block/reservation overlap
SELECT 1 FROM external_blocks
WHERE source IN ('airbnb')           -- extendable list
  AND :requested_start < end_date
  AND :requested_end   > start_date
LIMIT 1;
```
If either returns a row → reject.

Edge Cases:
- Adjacent ranges (end == start) allowed (no night overlap)
- Same-day check-in/check-out (zero-length) invalid if business rules disallow
- Cancelled bookings excluded by status filter
- External DTEND exclusive ensures correctness (do not subtract one day manually)

---
## 5a. Booking Status & Manual Confirmation
Context: No payment gateway integration; bookings are not auto-confirmed.

Status lifecycle:
- New booking → `pending`
- Admin review → `confirmed` (or `cancelled`)

Enforcement policy:
- Internal availability treats both `pending` and `confirmed` as blocking to prevent same-night double bookings before admin action.
- Outbound iCal feed options:
  1) Recommended: include `pending` as blocks (STATUS:TENTATIVE) so external platforms block immediately.
  2) Alternative: export only `confirmed` (use `status=confirmed` in feed URL). This reduces premature external blocking but increases risk of overlaps during the pending window.

Notes:
- Many platforms ignore STATUS field and simply block any VEVENT date range; test with your channels.
- Admin workflows remain the final authority; calendar logic exists to prevent conflicts during review.

---
## 5b. Automatic External Blocking Principle
Philosophy: Imported external calendar data (Airbnb feed) must immediately protect availability without waiting for admin review. Admin intervention is secondary (refinement, confirmation, manual adjustments), not required for baseline safety.

Key Tenets:
1. External blocks (e.g., SUMMARY:Not available) = hard barriers; booking creation rejected outright.
2. External reservations (future enhancement) will either create a synthetic pending booking or be stored as block+metadata until mapped.
3. Pending internal bookings still block to avoid race conditions while awaiting manual confirmation.
4. Outbound feed publishes pending bookings (TENTATIVE) unless explicitly filtered.

Advantages:
- Zero-delay double booking protection.
- Predictable behavior across channels – any feed change is authoritative.
- Simplified admin workload: only confirm genuine direct bookings; no emergency corrections.

Optional Override (future):
- Configuration flag `EXTERNAL_BLOCK_OVERRIDE=true` allowing admin to force a booking despite an external block (logged & highlighted). Default: disabled.
- If enabled, system records an audit entry: external source, UID, override timestamp, admin user.

Minimal Config Pattern (pseudo-PHP):
```php
// config/calendar.php
return [
  'include_pending_in_feed' => true,    // Pending exported as STATUS:TENTATIVE
  'allow_external_override' => false,  // Admin can force booking over external block
  'external_sources' => ['airbnb'],    // Extendable list
];
```

Usage Example:
```php
$cfg = require __DIR__.'/config/calendar.php';
if (!$cfg['allow_external_override'] && $bookingModel->isBlockedByExternal($from, $to)) {
    errorResponse('Dates blocked by external calendar', 409);
}
```

Feed Behavior Summary:
| Scenario | Pending Included | Pending Excluded |
|----------|------------------|------------------|
| Direct booking created | External platforms block instantly | External platforms may allow competing booking until confirm |
| Admin slow to confirm | Still protected | Vulnerable window |
| External block imported | Always protected | Always protected (independent of pending export) |

Recommendation: Keep `include_pending_in_feed = true` for maximum safety unless a business rule demands external platforms only reflect confirmed bookings.

---
## 6. Event Type Classification (Planned)
Add column `event_type ENUM('block','reservation','unknown')` to `external_blocks` once guest vs block differentiation needed.
Classification heuristic:
```
if summary = 'Not available' => block
else if summary LIKE '% - %' or contains guest-like pattern => reservation
else => unknown
```
This enables reporting (e.g., external reservation volume, source mix) without parsing on-the-fly.

---
## 7. Indexing Strategy
| Index | Purpose |
|-------|---------|
| UNIQUE(source, uid) | Prevent duplicate events on re-import |
| (source, start_date, end_date) | Fast range overlap filtering |
| (start_date) optional | Facilitates archival queries |

For very large scale (>100k rows): consider partitioning by year or source.

---
## 8. Performance Considerations
- Typical overlap check is constant-time due to index range narrowing
- Combined overhead of two short SELECT statements negligible (<10ms local)
- Bulk import: Upsert pattern (INSERT ... ON DUPLICATE KEY UPDATE) to avoid deletes
- ICS feed size: Airbnb typically <50 events; Booking.com similar; scaling safe

Optimizations (future):
- Cache day-level availability matrix (e.g., materialized view or Redis) for high-traffic search
- Nightly purge/compress of old external blocks beyond retention horizon

---
## 9. Retention & Archival
Policy suggestion:
- Keep external blocks for last 18 months (audit window)
- Cron job monthly: DELETE where end_date < CURDATE() - INTERVAL 18 MONTH
- Aggregate metrics (counts per source/month) stored separately for long-term analytics

Archival Flow:
1. SELECT rows to archive → write to `external_blocks_archive` (or CSV for cold storage)
2. DELETE from primary table

---
## 10. Import Scheduling
Recommended frequency: every 2–4 hours per source; high-volume listings hourly.
Batch job pseudo-flow:
```
for each active_source:
  fetch ICS → parse → for each event upsert external_blocks
  record run stats (events_seen, new, updated, duration, errors)
```
Store stats in a lightweight `import_runs` table for monitoring.

---
## 11. Monitoring & Observability
Metrics:
- events_imported_new
- events_imported_updated
- import_duration_ms
- last_run_timestamp
- overlap_rejections (count per day)

Alerts:
- Import gap > 12h
- Sudden spike in blocks (possible misconfiguration)
- High overlap rejection ratio (>X%) suggests channel sync drift

---
## 12. Failure Modes & Mitigations
| Failure | Impact | Mitigation |
|---------|--------|-----------|
| ICS unreachable | External blocks stale | Retry/backoff; alert after N failures |
| UID format change by provider | Duplicates / missed updates | Fallback hash + monitoring of UID entropy |
| Large unexpected block range | Availability collapse | Flag ranges >90 days for manual review |
| Timezone misinterpretation | Off-by-one night block | Use VALUE=DATE semantics; treat start/end as local all-day |
| Table bloat | Slow queries | Implement retention purge + index maintenance |

---
## 13. Security & Privacy
- Only essential block data stored (dates, summary) – minimal PII
- raw_event JSON may contain guest names → consider redaction if policy requires
- Access control: restrict import endpoints; consider token gating
- Signed outbound URLs (future) to curb scraping

---
## 14. Extension Path
Phase 1 (Now): Implement overlap enforcement using existing schema.
Phase 2: Add event_type + multi-source imports (Booking.com, VRBO).
Phase 3: Availability caching + analytics dashboard.
Phase 4: Webhook / push-based sync where supported.
Phase 5: Channel manager abstraction with pluggable adapters.

---
## 15. Implementation Checklist
[x] Verify `external_blocks` table created in production DB
[x] Add booking overlap check (internal + external) before insertion
[ ] Add import scheduling (cron / task scheduler)
[ ] Add admin UI panel listing external blocks (filter by source & date)
[ ] Add event_type classification logic
[ ] Implement retention purge job
[ ] Add import_runs logging table + dashboard metrics
[ ] Add config file for calendar flags (include_pending_in_feed, allow_external_override)
[ ] Expose dual subscription URLs (all vs confirmed-only)
[ ] Add synthetic external reservation → internal pending mapper (optional phase)

---
## 16. Quick Reference Snippets
### Overlap Enforcement (PHP Pseudocode)
```php
function isDateRangeBlocked($pdo, $start, $end) {
  $sql = "SELECT 1 FROM external_blocks WHERE source = 'airbnb' AND ? < end_date AND ? > start_date LIMIT 1";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$start, $end]);
  return (bool)$stmt->fetchColumn();
}
```
### Upsert Logic Example
```sql
INSERT INTO external_blocks (source, uid, start_date, end_date, summary, description, last_seen, raw_event)
VALUES (:source, :uid, :start_date, :end_date, :summary, :description, NOW(), :raw_event)
ON DUPLICATE KEY UPDATE
  start_date = VALUES(start_date),
  end_date   = VALUES(end_date),
  summary    = VALUES(summary),
  description= VALUES(description),
  last_seen  = NOW(),
  raw_event  = VALUES(raw_event);
```

---
## 17. Risks If Not Implemented
- Double bookings from external platforms remain possible
- Manual reconciliation overhead increases
- Lack of historical audit trail for imported blocks
- Harder to scale beyond single external source

---
## 18. Summary
A database-centric calendar strategy gives reliable availability control, auditability, and clear growth paths. Implementing enforcement + scheduling completes double-booking protection. Future refinements (classification, retention, analytics) layer naturally on the existing schema.

---
## 19. Next Enhancements Snapshot
Short-Term (High Value): import scheduling, admin external blocks panel, config flags, dual feed URLs.
Mid-Term: event_type classification, synthetic external reservation mapping, retention purge automation.
Long-Term: analytics dashboard, multi-source abstraction, override auditing UI, webhook acceleration.

---
*This document complements `CALENDAR_DOCUMENTATION.md` (feature overview) and `ICAL_DOCUMENTATION.md` (endpoint specifics), focusing strictly on database design strategy.*
