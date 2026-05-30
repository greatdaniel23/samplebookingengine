import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  RefreshCw, Copy, Check, AlertCircle, CheckCircle,
  Download, Link, Trash2, ExternalLink, Calendar, Plus
} from 'lucide-react';
import { paths } from '@/config/paths';
import { getAuthToken } from '@/config/cloudflare';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlatformConfig {
  key: string;          // e.g. 'airbnb_ical_url'
  source: string;       // e.g. 'airbnb'
  label: string;
  placeholder: string;
  color: string;        // tailwind color prefix e.g. 'red'
  avatar: string;
  helpText: string;
}

interface SyncStatus {
  saved: boolean;
  url: string;
  blockCount: number;
  syncing: boolean;
  lastResult: string | null;
  error: string | null;
}

type PlatformStatuses = Record<string, SyncStatus>;

// ─── Platform definitions ─────────────────────────────────────────────────────

const PLATFORMS: PlatformConfig[] = [
  {
    key: 'airbnb_ical_url',
    source: 'airbnb',
    label: 'Airbnb',
    placeholder: 'https://www.airbnb.com/calendar/ical/YOUR-LISTING-ID.ics?s=...',
    color: 'red',
    avatar: 'A',
    helpText: 'Airbnb → Hosting → Calendar → Export Calendar → Copy Link',
  },
  {
    key: 'booking_ical_url',
    source: 'booking',
    label: 'Booking.com',
    placeholder: 'https://admin.booking.com/hotel/hoteladmin/ical.ics?...',
    color: 'blue',
    avatar: 'B',
    helpText: 'Booking.com Extranet → Calendar → Synchronization → Export',
  },
  {
    key: 'vrbo_ical_url',
    source: 'vrbo',
    label: 'VRBO / Expedia',
    placeholder: 'https://www.vrbo.com/calendar/ical/YOUR-ID.ics',
    color: 'orange',
    avatar: 'V',
    helpText: 'VRBO Dashboard → Calendar → Availability → Export Calendar',
  },
];

// ─── Helper: auth headers ─────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ICalSyncManager: React.FC = () => {
  const [inputUrls, setInputUrls] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<PlatformStatuses>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [exportUrl, setExportUrl] = useState('');
  const [webcalUrl, setWebcalUrl] = useState('');
  const [loadingInit, setLoadingInit] = useState(true);
  const [removeTarget, setRemoveTarget] = useState<any>(null);

  // ── Load config + block counts on mount ──────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoadingInit(true);
    try {
      // 1. Load saved URLs
      const cfgRes = await fetch(paths.buildApiUrl('calendar/config'), {
        headers: authHeaders(),
      });
      const cfgJson = await cfgRes.json();
      const cfg: Record<string, string | null> = cfgJson.data ?? cfgJson ?? {};

      // 2. Load external blocks grouped by source
      const blkRes = await fetch(paths.buildApiUrl('calendar/external-blocks'), {
        headers: authHeaders(),
      });
      const blkJson = await blkRes.json();
      const blocks: any[] = blkJson.data?.data ?? blkJson.data ?? [];

      const countBySource: Record<string, number> = {};
      blocks.forEach((b: any) => {
        countBySource[b.source] = (countBySource[b.source] || 0) + 1;
      });

      // 3. Load export/subscribe URLs
      const subRes = await fetch(paths.buildApiUrl('calendar/subscribe'));
      const subJson = await subRes.json();
      const sub = subJson.data ?? subJson ?? {};
      setExportUrl(sub.subscribe_url || paths.buildApiUrl('calendar/ical'));
      setWebcalUrl(sub.webcal_url || '');

      // 4. Build per-platform state
      const newUrls: Record<string, string> = {};
      const newStatuses: PlatformStatuses = {};
      PLATFORMS.forEach((p) => {
        const saved = cfg[p.key] || '';
        newUrls[p.source] = saved;
        newStatuses[p.source] = {
          saved: !!saved,
          url: saved,
          blockCount: countBySource[p.source] || 0,
          syncing: false,
          lastResult: null,
          error: null,
        };
      });
      setInputUrls(newUrls);
      setStatuses(newStatuses);
    } catch (err) {
      console.error('ICalSyncManager: loadAll failed', err);
    } finally {
      setLoadingInit(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Save URL for a platform ────────────────────────────────────────────────
  const saveUrl = async (platform: PlatformConfig) => {
    const url = inputUrls[platform.source]?.trim() || '';
    if (!url) return;

    setSaving((s) => ({ ...s, [platform.source]: true }));
    setStatuses((s) => ({
      ...s,
      [platform.source]: { ...s[platform.source], error: null, lastResult: null },
    }));

    try {
      const res = await fetch(paths.buildApiUrl('calendar/config'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ [platform.key]: url }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to save');

      setStatuses((s) => ({
        ...s,
        [platform.source]: { ...s[platform.source], saved: true, url },
      }));
    } catch (err: any) {
      setStatuses((s) => ({
        ...s,
        [platform.source]: { ...s[platform.source], error: err.message },
      }));
    } finally {
      setSaving((s) => ({ ...s, [platform.source]: false }));
    }
  };

  // ── Sync a platform now ────────────────────────────────────────────────────
  const syncNow = async (platform: PlatformConfig) => {
    const url = statuses[platform.source]?.url || inputUrls[platform.source]?.trim() || '';
    if (!url) {
      setStatuses((s) => ({
        ...s,
        [platform.source]: { ...s[platform.source], error: 'Please save a URL first' },
      }));
      return;
    }

    setStatuses((s) => ({
      ...s,
      [platform.source]: { ...s[platform.source], syncing: true, error: null, lastResult: null },
    }));

    try {
      const res = await fetch(paths.buildApiUrl('calendar/sync'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ url, source: platform.source }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Sync failed');

      const d = json.data ?? {};
      const msg = `Synced: ${d.events_processed ?? 0} events (${d.inserted ?? 0} new, ${d.updated ?? 0} updated)`;

      // Refresh block count
      const blkRes = await fetch(
        paths.buildApiUrl(`calendar/external-blocks?source=${platform.source}`),
        { headers: authHeaders() }
      );
      const blkJson = await blkRes.json();
      const blocks: any[] = blkJson.data?.data ?? blkJson.data ?? [];

      setStatuses((s) => ({
        ...s,
        [platform.source]: {
          ...s[platform.source],
          lastResult: msg,
          blockCount: blocks.length,
        },
      }));
    } catch (err: any) {
      setStatuses((s) => ({
        ...s,
        [platform.source]: { ...s[platform.source], error: err.message },
      }));
    } finally {
      setStatuses((s) => ({
        ...s,
        [platform.source]: { ...s[platform.source], syncing: false },
      }));
    }
  };

  // ── Remove (clear) a platform ──────────────────────────────────────────────
  const removePlatform = async (platform: PlatformConfig) => {

    try {
      // Clear config URL
      await fetch(paths.buildApiUrl('calendar/config'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ [platform.key]: null }),
      });

      // Delete all blocks for this source
      const blkRes = await fetch(
        paths.buildApiUrl(`calendar/external-blocks?source=${platform.source}`),
        { headers: authHeaders() }
      );
      const blkJson = await blkRes.json();
      const blocks: any[] = blkJson.data?.data ?? blkJson.data ?? [];
      await Promise.all(
        blocks.map((b: any) =>
          fetch(paths.buildApiUrl(`calendar/external-blocks/${b.id}`), {
            method: 'DELETE',
            headers: authHeaders(),
          })
        )
      );

      setInputUrls((u) => ({ ...u, [platform.source]: '' }));
      setStatuses((s) => ({
        ...s,
        [platform.source]: {
          saved: false,
          url: '',
          blockCount: 0,
          syncing: false,
          lastResult: null,
          error: null,
        },
      }));
    } catch (err: any) {
      setStatuses((s) => ({
        ...s,
        [platform.source]: { ...s[platform.source], error: err.message },
      }));
    }
  };

  // ── Copy helper ────────────────────────────────────────────────────────────
  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  };

  // ── Download .ics ──────────────────────────────────────────────────────────
  const downloadIcs = () => {
    const a = document.createElement('a');
    a.href = exportUrl + (exportUrl.includes('?') ? '&' : '?') + 'format=ics';
    a.download = 'villa-bookings.ics';
    a.click();
  };

  // ─────────────────────────────────────────────────────────────────────────

  if (loadingInit) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="w-6 h-6 animate-spin text-samudra-gold mr-3" />
        <span className="text-gray-600">Loading sync configuration…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">iCal Sync Manager</h2>
          <p className="text-sm text-gray-500 mt-1">
            Import blocked dates from external platforms and export your calendar.
          </p>
        </div>
        <button
          onClick={loadAll}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ── Import from platforms ──────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Download className="w-4 h-4 text-gray-500" />
          Import External Calendars
        </h3>

        {PLATFORMS.map((platform) => {
          const st = statuses[platform.source] ?? {
            saved: false, url: '', blockCount: 0, syncing: false, lastResult: null, error: null,
          };

          const colorMap: Record<string, string> = {
            red:    'bg-red-50 border-red-200',
            blue:   'bg-blue-50 border-blue-200',
            orange: 'bg-orange-50 border-orange-200',
          };
          const avatarMap: Record<string, string> = {
            red:    'bg-red-500',
            blue:   'bg-blue-600',
            orange: 'bg-orange-500',
          };
          const btnMap: Record<string, string> = {
            red:    'bg-red-600 hover:bg-red-700',
            blue:   'bg-blue-600 hover:bg-blue-700',
            orange: 'bg-orange-600 hover:bg-orange-700',
          };

          return (
            <div key={platform.source} className={`rounded-xl border p-5 ${colorMap[platform.color]}`}>
              {/* Platform header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${avatarMap[platform.color]} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                    {platform.avatar}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{platform.label}</span>
                    {st.saved && (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Connected
                      </span>
                    )}
                    {!st.saved && (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        Not configured
                      </span>
                    )}
                  </div>
                </div>

                {st.saved && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">
                      {st.blockCount} blocked date{st.blockCount !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => syncNow(platform)}
                      disabled={st.syncing}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm text-white rounded-lg transition-colors ${btnMap[platform.color]} disabled:opacity-50`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${st.syncing ? 'animate-spin' : ''}`} />
                      {st.syncing ? 'Syncing…' : 'Sync Now'}
                    </button>
                    <button
                      onClick={() => setRemoveTarget(platform)}
                      className="p-1.5 text-samudra-ink-mute hover:text-[#7a3d31] transition-colors h-9 w-9 flex items-center justify-center"
                      aria-label={`Remove ${platform.label} integration`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* URL row */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={inputUrls[platform.source] ?? ''}
                  onChange={(e) =>
                    setInputUrls((u) => ({ ...u, [platform.source]: e.target.value }))
                  }
                  placeholder={platform.placeholder}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-samudra-gold"
                />
                <button
                  onClick={() => saveUrl(platform)}
                  disabled={saving[platform.source] || !inputUrls[platform.source]?.trim()}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-lg transition-colors ${btnMap[platform.color]} disabled:opacity-40`}
                >
                  {saving[platform.source] ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {st.saved ? 'Update' : 'Save'}
                </button>
                {!st.saved && (
                  <button
                    onClick={() => syncNow(platform)}
                    disabled={st.syncing || !inputUrls[platform.source]?.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-gray-700 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${st.syncing ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                )}
              </div>

              {/* Help text */}
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {platform.helpText}
              </p>

              {/* Success / error feedback */}
              {st.lastResult && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {st.lastResult}
                </div>
              )}
              {st.error && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {st.error}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Export / Share ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Link className="w-4 h-4 text-gray-500" />
          Share Your Calendar
        </h3>
        <p className="text-sm text-gray-500">
          Give these URLs to Airbnb, Booking.com, or VRBO so they can import your bookings and block those dates automatically.
        </p>

        {/* iCal URL */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            iCal Feed URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={exportUrl}
              readOnly
              className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
            />
            <button
              onClick={() => copyText(exportUrl, 'ical')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied === 'ical' ? (
                <><Check className="w-4 h-4 text-green-600" /><span className="text-green-600">Copied</span></>
              ) : (
                <><Copy className="w-4 h-4" /><span>Copy</span></>
              )}
            </button>
          </div>
        </div>

        {/* WebCal URL */}
        {webcalUrl && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              WebCal URL (Apple Calendar / Outlook)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={webcalUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
              />
              <button
                onClick={() => copyText(webcalUrl, 'webcal')}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied === 'webcal' ? (
                  <><Check className="w-4 h-4 text-green-600" /><span className="text-green-600">Copied</span></>
                ) : (
                  <><Copy className="w-4 h-4" /><span>Copy</span></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Download .ics */}
        <button
          onClick={downloadIcs}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-samudra-gold hover:bg-samudra-ink-mute rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Download .ics File
        </button>
      </div>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          How Two-Way Sync Works
        </h3>
        <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside">
          <li>Copy your <strong>iCal Feed URL</strong> above and paste it into Airbnb / Booking.com / VRBO as an "imported calendar" — they will block those dates on their end.</li>
          <li>Paste the <strong>Airbnb / Booking.com / VRBO calendar URL</strong> in the import section above and click <strong>Sync Now</strong> — this blocks dates on your booking engine.</li>
          <li>Click <strong>Sync Now</strong> any time to refresh. The system auto-syncs every 30 minutes for connected platforms.</li>
        </ol>
      </div>

      {/* Remove Platform Confirm */}
      <AlertDialog open={!!removeTarget} onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}>
        <AlertDialogContent className="bg-samudra-paper border border-samudra-paper-deep">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-[22px] font-normal text-samudra-ink">
              Disconnect {removeTarget?.label}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-samudra-ink-mute" style={{ fontFamily: 'var(--font-label)' }}>
              Bookings already imported will remain. Future updates from this feed will stop.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel className="h-11 border border-samudra-ink text-samudra-ink bg-samudra-paper text-[11px] tracking-[0.3em] uppercase px-6" style={{ fontFamily: 'var(--font-label)' }}>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (removeTarget) { removePlatform(removeTarget); setRemoveTarget(null); } }}
              className="h-11 bg-[#7a3d31] text-samudra-paper text-[11px] tracking-[0.3em] uppercase px-6" style={{ fontFamily: 'var(--font-label)' }}>Disconnect</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ICalSyncManager;
