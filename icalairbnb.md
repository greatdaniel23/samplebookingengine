# Airbnb iCal Integration (Simple Explanation)

You asked for a clearer guide because the previous version felt too technical. This version explains everything step‑by‑step and in plain language.

---
## 1. What is iCal / ICS?
iCal (ICS file) is a standard text format that lists calendar events. Airbnb gives you an iCal link for your listing; other systems (like ours) can read it to know which dates are unavailable. We also generate our own iCal so Airbnb can block dates when we get bookings directly.

Think of it as: "A shared read-only calendar file that systems periodically download."

---
## 2. Two Directions (Push vs Pull)
| Direction | Purpose | What it does |
|-----------|---------|--------------|
| A. Push (Our → Airbnb) | Tell Airbnb when we already have bookings | Airbnb blocks those dates automatically |
| B. Pull (Airbnb → Our) | Detect bookings or manual blocks made in Airbnb | We mark those dates unavailable in our engine |

You can use one or both. Both together give two‑way sync.

---
## 3. Direction A: Send OUR bookings to Airbnb (Already Working)
1. Visit: `https://api.rumahdaisycantik.com/ical.php?action=subscribe`
2. Copy `subscribe_url` (regular HTTPS). Ignore `webcal_url` unless an app requires it.
3. In Airbnb: Host Dashboard → Listings → Availability → Sync calendars → Import calendar.
4. Paste the URL and save.
5. Airbnb will check that URL regularly (typically every few hours) and block the dates contained in it.

Notes:
- Our feed marks events as busy (TRANSP:OPAQUE). That’s what Airbnb needs.
- Keep the URL secret; anyone with the link can see the blocked date ranges (no guest names included).

---
## 4. Direction B: Read Airbnb blocks into OUR system (Now Partially Implemented)
Airbnb gives you a link like:
```
https://www.airbnb.com/calendar/ical/1157570755723100983.ics?s=1a128eefab2f47552020fb2a1b407b44
```
We added tools to fetch and parse this:
- `api/ical_proxy.php` (test parsing only)
- `airbnb-ical-test.html` (browser page to view events)
- `api/ical_import_airbnb.php` (imports events into database)
- `database/external_blocks.sql` (table for storing blocks)

### How to import (manual test)
1. Run the SQL in `database/external_blocks.sql` so the `external_blocks` table exists.
2. Call:
```
http://localhost/.../api/ical_import_airbnb.php?source=<YOUR_AIRBNB_ICAL_URL>
```
3. Response shows: `inserted`, `updated`, `skipped` counts.
4. Query blocks:
```sql
SELECT * FROM external_blocks ORDER BY start_date;
```

### Interpreting Dates (IMPORTANT)
iCal all‑day events use:
```
DTSTART;VALUE=DATE:20260811
DTEND;VALUE=DATE:20261114
```
Meaning: nights from Aug 11 up to (but not including) the night starting Nov 14. Last blocked night = Nov 13.

### Typical Airbnb Event
Summary might be `Not available` or a booking code. We treat all events as “blocked availability” unless we later detect a status field.

### Deduplication
Each event has UID. We upsert by UID. If UID missing, we create one using SHA1 of (start + end + source).

---
## 5. What Happens Next?
To finish full sync we need:
1. Change room availability logic to ALSO exclude any date that falls inside `external_blocks` ranges.
2. Add an Admin UI panel to list external sources (Airbnb URL) and last import time.
3. Add a cron job (e.g. every 30–60 minutes) calling the import endpoint.
4. Optional: show combined calendar (our bookings + external blocks) visually.

---
## 6. Simple Glossary
- ICS: The file format containing calendar events.
- VEVENT: A single event block in ICS (start/end + summary + UID).
- UID: Unique identifier; lets us update instead of duplicate.
- DTSTART: Start date (inclusive).
- DTEND: End date (exclusive for all‑day events).
- Block: A period when the listing cannot be booked.

---
## 7. Quick Troubleshooting
| Problem | Cause | Fix |
|---------|-------|-----|
| Zero events parsed | No bookings / no blocks in Airbnb | Create a manual block in Airbnb and retry |
| Import shows many skipped | Missing dates in events | Ignore; often harmless |
| Dates off by one | Forgetting DTEND is exclusive | Subtract 1 day from DTEND for last blocked night |
| Duplicate rows | UID changed by Airbnb | We fallback to SHA1; usually stable |

---
## 8. Testing Tools Recap
- View parsed events: `airbnb-ical-test.html`
- Raw feed to our system: `api/ical_import_airbnb.php?source=...`
- Outbound to Airbnb: `ical.php?action=subscribe`

---
## 9. Security Notes
- Only allow trusted domains (we currently regex‑match Airbnb pattern).
- Don’t expose guest personal data in outbound feed (our feed is clean).
- Consider rate limiting repeated imports.

---
## 10. Example: Turning One Event Into a Block
Event: `Start 2026-08-11` / `End 2026-11-14` → Block nights from Aug 11 through Nov 13.
SQL to detect overlap for a date `d`:
```sql
SELECT 1 FROM external_blocks
WHERE d >= start_date AND d < end_date;
```
Use this condition when deciding if a date is bookable.

---
## 11. Next Concrete Actions (If You Want Full Automation)
1. Integrate overlap check into availability API.
2. Store Airbnb URL in a small settings table so you don’t pass `source=` manually.
3. Add cron: `php /path/to/api/ical_import_airbnb.php?source=<URL>`.
4. Display merged calendar in admin dashboard.

---
## 12. Original Airbnb URL
https://www.airbnb.com/calendar/ical/1157570755723100983.ics?s=1a128eefab2f47552020fb2a1b407b44

If anything here still feels unclear, tell me which part and I’ll simplify further.
