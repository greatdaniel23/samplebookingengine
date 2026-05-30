/**
 * SchemaLibrarySection.tsx — Library > Schema admin page
 * =======================================================
 * Samudra admin UI for editing schema.org JSON-LD field overrides stored in
 * D1 `schema_settings` table.  Mirrors the Library group sidebar pattern from
 * ImagesLibrarySection / AmenitiesSection.
 *
 * Structure:
 *   - Site-wide card (_global) — expanded by default
 *   - 7 per-route cards: / /stay /dine /spa /experiences /journal /reservations
 *   - Save button per card + global Save All
 *
 * Field resolution reminder (inline hint):
 *   schema_settings override → D1 entity data (rooms / packages / homepage_settings) → PROPERTY_CONSTANTS fallback
 *
 * Authorization: Daniel 2026-05-19
 * Author: MASON · 2026-05-19
 */

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { paths } from '@/config/paths';
import { getAuthToken } from '@/config/cloudflare';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronDown,
  ChevronUp,
  Save,
  RefreshCw,
  Globe,
  Home,
  BedDouble,
  UtensilsCrossed,
  Sparkles,
  Map,
  BookOpen,
  CalendarCheck,
  Info,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SchemaFields {
  [key: string]: string | number | undefined;
}

interface RouteCard {
  route: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  description: string;
  fields: FieldDef[];
  hint?: string;
}

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'url' | 'email' | 'tel' | 'time' | 'lat' | 'lng';
  placeholder?: string;
  required?: boolean;
  hint?: string;
}

// ── Route + field definitions (from TAGGER spec 2026-05-19) ───────────────────

const GLOBAL_FIELDS: FieldDef[] = [
  // Identity
  { key: 'brandName',       label: 'Brand Name',           type: 'text',   placeholder: 'Samudra',                         required: true },
  { key: 'legalName',       label: 'Legal Name',           type: 'text',   placeholder: 'Samudra Villa Uluwatu' },
  { key: 'origin',          label: 'Production URL',       type: 'url',    placeholder: 'https://villa.alphadigitalagency.id', required: true, hint: 'Canonical production domain — no trailing slash' },
  // Geo
  { key: 'geoLatitude',     label: 'Latitude',             type: 'lat',    placeholder: '-8.829',                          required: true },
  { key: 'geoLongitude',    label: 'Longitude',            type: 'lng',    placeholder: '115.0879',                        required: true },
  // Pricing
  { key: 'priceRange',      label: 'Price Range',          type: 'text',   placeholder: '$$$$',                            hint: 'Use $ symbols: $ | $$ | $$$ | $$$$' },
  // Address
  { key: 'addressStreet',   label: 'Street Address',       type: 'text',   placeholder: 'Uluwatu, Pecatu' },
  { key: 'addressLocality', label: 'City / Locality',      type: 'text',   placeholder: 'Kuta Selatan' },
  { key: 'addressRegion',   label: 'Province / Region',    type: 'text',   placeholder: 'Bali' },
  { key: 'addressPostal',   label: 'Postal Code',          type: 'text',   placeholder: '80361' },
  { key: 'addressCountry',  label: 'Country Code (ISO)',   type: 'text',   placeholder: 'ID',                              hint: '2-letter ISO 3166-1 alpha-2' },
  // Operations
  { key: 'checkinTime',     label: 'Check-in Time',        type: 'time',   placeholder: '14:00',                           hint: 'HH:MM — auto-filled from D1 homepage_settings if blank' },
  { key: 'checkoutTime',    label: 'Check-out Time',       type: 'time',   placeholder: '12:00',                           hint: 'HH:MM — auto-filled from D1 homepage_settings if blank' },
  // Contact
  { key: 'phone',           label: 'Phone',                type: 'tel',    placeholder: '+62 361 ...',                     hint: 'Auto-filled from D1 homepage_settings if blank' },
  { key: 'email',           label: 'Email',                type: 'email',  placeholder: 'hello@samudrabali.com',           hint: 'Auto-filled from D1 homepage_settings if blank' },
  // Social
  { key: 'socialFacebook',  label: 'Facebook URL',         type: 'url',    placeholder: 'https://facebook.com/...' },
  { key: 'socialInstagram', label: 'Instagram URL',        type: 'url',    placeholder: 'https://instagram.com/...' },
  { key: 'socialTwitter',   label: 'Twitter / X URL',      type: 'url',    placeholder: 'https://twitter.com/...' },
  // Image
  { key: 'primaryImage',    label: 'Primary Image URL',    type: 'url',    placeholder: 'https://...',                     hint: 'Auto-filled from room_images (is_primary=1) if blank' },
  // Attributes
  { key: 'languagesSpoken', label: 'Languages Spoken',     type: 'text',   placeholder: 'en,id',                          hint: 'Comma-separated ISO 639-1 codes' },
  { key: 'paymentAccepted', label: 'Payment Methods',      type: 'text',   placeholder: 'Cash,Credit Card,Bank Transfer', hint: 'Comma-separated' },
  // Restaurant
  { key: 'restaurantName',           label: 'Restaurant Name',           type: 'text', placeholder: 'Samudra Dining' },
  { key: 'restaurantCuisine',        label: 'Cuisine',                   type: 'text', placeholder: 'Indonesian, Asian Fusion' },
  { key: 'restaurantPriceRange',     label: 'Restaurant Price Range',    type: 'text', placeholder: '$$$$' },
  { key: 'restaurantBreakfastOpen',  label: 'Breakfast Opens',           type: 'time', placeholder: '07:00' },
  { key: 'restaurantBreakfastClose', label: 'Breakfast Closes',          type: 'time', placeholder: '10:30' },
  { key: 'restaurantDinnerOpen',     label: 'Dinner Opens',              type: 'time', placeholder: '18:00' },
  { key: 'restaurantDinnerClose',    label: 'Dinner Closes',             type: 'time', placeholder: '22:00' },
  // Spa
  { key: 'spaName',  label: 'Spa Name',         type: 'text', placeholder: 'Samudra Spa & Wellness' },
  { key: 'spaOpen',  label: 'Spa Opens',         type: 'time', placeholder: '10:00' },
  { key: 'spaClose', label: 'Spa Closes',        type: 'time', placeholder: '20:00' },
];

const ROUTE_CARDS: RouteCard[] = [
  {
    route: '/',
    label: 'Home',
    icon: Home,
    description: 'LodgingBusiness + WebSite schema. Override page-level fields (not needed for most properties — site-wide values above are used).',
    hint: 'Route overrides merge on top of Site-wide fields. Leave empty to use site-wide defaults.',
    fields: [
      { key: 'pageTitle', label: 'Page Title (schema)', type: 'text', placeholder: 'Samudra — A Clifftop Sanctuary, Uluwatu, Bali' },
      { key: 'pageDescription', label: 'Page Description', type: 'textarea', placeholder: 'Private clifftop villa estate in Uluwatu, Bali.' },
    ],
  },
  {
    route: '/stay',
    label: 'Stay',
    icon: BedDouble,
    description: 'ItemList of Product + Offer (one per active suite). Room data is auto-filled from D1 `rooms` table.',
    hint: 'Suite prices and images are auto-filled from D1. Override only if you need to add page-level copy.',
    fields: [
      { key: 'itemListName',    label: 'Suite List Name',   type: 'text',     placeholder: 'Suites at Samudra' },
      { key: 'pageDescription', label: 'Page Description',  type: 'textarea', placeholder: 'Five clifftop suites with Indian Ocean views.' },
    ],
  },
  {
    route: '/dine',
    label: 'Dine',
    icon: UtensilsCrossed,
    description: 'Restaurant schema. Restaurant fields come from Site-wide settings (restaurantName, restaurantCuisine, etc.).',
    hint: 'Restaurant fields edited in Site-wide card above. Route overrides here only for page-level description.',
    fields: [
      { key: 'pageDescription', label: 'Page Description', type: 'textarea', placeholder: 'Clifftop dining at Samudra — sunset views, Indonesian and Asian Fusion cuisine.' },
    ],
  },
  {
    route: '/spa',
    label: 'Spa & Wellness',
    icon: Sparkles,
    description: 'HealthAndBeautyBusiness schema. Spa name and hours from Site-wide settings (spaName, spaOpen, spaClose).',
    hint: 'Spa fields edited in Site-wide card above. Route overrides here only for page-level description.',
    fields: [
      { key: 'pageDescription', label: 'Page Description', type: 'textarea', placeholder: 'Holistic spa treatments with clifftop panoramas.' },
    ],
  },
  {
    route: '/experiences',
    label: 'Experiences',
    icon: Map,
    description: 'ItemList of TouristAttraction. Experience items auto-filled from D1 `packages` table (experiences category). Falls back to PROPERTY_CONSTANTS hardcoded list if D1 empty.',
    hint: 'Experiences auto-filled from D1 packages. Override only if you want a different list name or description.',
    fields: [
      { key: 'itemListName',    label: 'Experiences List Name', type: 'text',     placeholder: 'Experiences at Samudra' },
      { key: 'pageDescription', label: 'Page Description',      type: 'textarea', placeholder: 'Clifftop yoga, surf lessons, Balinese cooking classes, and more.' },
    ],
  },
  {
    route: '/journal',
    label: 'The Journal',
    icon: BookOpen,
    description: 'Blog shell schema (v1 — no journal_posts D1 table yet). Emit Blog entity with name + url.',
    hint: 'Blog post items require a journal_posts D1 table (future). Currently emitting Blog shell only (TAGGER spec Option A).',
    fields: [
      { key: 'blogName',        label: 'Blog Name',        type: 'text',     placeholder: 'The Samudra Journal' },
      { key: 'pageDescription', label: 'Blog Description', type: 'textarea', placeholder: 'Stories, insights, and inspiration from Samudra\'s clifftop sanctuary.' },
    ],
  },
  {
    route: '/reservations',
    label: 'Reservations',
    icon: CalendarCheck,
    description: 'WebPage schema with mainEntity → LodgingBusiness reference. No Offer here (offers live on /stay per TAGGER spec).',
    hint: 'No aggregateRating — Daniel ratified skip until real review source is wired.',
    fields: [
      { key: 'pageTitle',       label: 'Page Title (schema)',   type: 'text',     placeholder: 'Book Your Stay at Samudra' },
      { key: 'pageDescription', label: 'Page Description',      type: 'textarea', placeholder: 'Reserve a clifftop suite at Samudra, Uluwatu.' },
    ],
  },
];

// ── Helper ─────────────────────────────────────────────────────────────────────

function fieldInputType(type: FieldDef['type']): string {
  if (type === 'lat' || type === 'lng' || type === 'number') return 'number';
  if (type === 'url') return 'url';
  if (type === 'email') return 'email';
  if (type === 'tel') return 'tel';
  if (type === 'time') return 'time';
  return 'text';
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface FieldRowProps {
  def: FieldDef;
  value: string;
  onChange: (key: string, val: string) => void;
}

const FieldRow: React.FC<FieldRowProps> = ({ def, value, onChange }) => (
  <div className="space-y-1.5">
    <Label htmlFor={`field-${def.key}`} className="text-xs font-medium text-samudra-ink flex items-center gap-1">
      {def.label}
      {def.required && <span className="text-red-500 font-bold">*</span>}
    </Label>
    {def.type === 'textarea' ? (
      <Textarea
        id={`field-${def.key}`}
        value={value}
        onChange={e => onChange(def.key, e.target.value)}
        placeholder={def.placeholder}
        className="h-20 text-sm resize-none font-body text-samudra-ink bg-samudra-paper border-samudra-ink/20 focus:border-samudra-teal focus:ring-samudra-teal/20"
      />
    ) : (
      <Input
        id={`field-${def.key}`}
        type={fieldInputType(def.type)}
        value={value}
        onChange={e => onChange(def.key, e.target.value)}
        placeholder={def.placeholder}
        step={def.type === 'lat' || def.type === 'lng' ? 'any' : undefined}
        className="h-9 text-sm font-body text-samudra-ink bg-samudra-paper border-samudra-ink/20 focus:border-samudra-teal focus:ring-samudra-teal/20"
      />
    )}
    {def.hint && (
      <p className="text-[11px] text-samudra-ink-mute leading-relaxed flex items-start gap-1">
        <Info className="h-3 w-3 mt-0.5 flex-shrink-0 text-samudra-teal" />
        {def.hint}
      </p>
    )}
  </div>
);

// ── RouteCardPanel ─────────────────────────────────────────────────────────────

interface RouteCardPanelProps {
  card: RouteCard;
  fields: FieldDef[];
  values: SchemaFields;
  saving: boolean;
  defaultOpen?: boolean;
  onFieldChange: (route: string, key: string, val: string) => void;
  onSave: (route: string) => Promise<void>;
}

const RouteCardPanel: React.FC<RouteCardPanelProps> = ({
  card,
  fields,
  values,
  saving,
  defaultOpen = false,
  onFieldChange,
  onSave,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = card.icon;
  const isEmpty = fields.every(f => !values[f.key]);

  return (
    <Card className="border border-samudra-ink/10 bg-samudra-paper shadow-sm">
      <CardHeader
        className="px-6 py-4 cursor-pointer select-none flex flex-row items-center justify-between"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${open ? 'bg-samudra-teal/10' : 'bg-samudra-ink/5'}`}>
            <Icon className={`h-4 w-4 ${open ? 'text-samudra-teal' : 'text-samudra-ink-mute'}`} />
          </div>
          <div>
            <CardTitle className="font-display text-base text-samudra-ink tracking-wide">
              {card.label}
              {isEmpty && (
                <span className="ml-2 text-[10px] eyebrow text-samudra-ink-mute font-normal tracking-widest">
                  using D1 defaults
                </span>
              )}
            </CardTitle>
            <p className="text-[11px] text-samudra-ink-mute mt-0.5 font-body">{card.description}</p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-samudra-ink-mute flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-samudra-ink-mute flex-shrink-0" />
        )}
      </CardHeader>

      {open && (
        <CardContent className="px-6 pb-6 pt-0 space-y-4">
          {card.hint && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-samudra-teal/5 border border-samudra-teal/20">
              <Info className="h-3.5 w-3.5 text-samudra-teal mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-samudra-ink-mute leading-relaxed">{card.hint}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.key} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
                <FieldRow
                  def={f}
                  value={String(values[f.key] ?? '')}
                  onChange={(key, val) => onFieldChange(card.route, key, val)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-samudra-ink/5">
            <Button
              onClick={() => onSave(card.route)}
              disabled={saving}
              size="sm"
              className="bg-samudra-teal hover:bg-samudra-teal/90 text-white h-9 px-4 text-sm"
            >
              {saving ? (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1.5" />
              )}
              Save {card.label}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const SchemaLibrarySection: React.FC = () => {
  // fieldValues: { [route]: { [fieldKey]: string } }
  const [fieldValues, setFieldValues] = useState<Record<string, SchemaFields>>({});
  const [loading, setLoading] = useState(true);
  const [savingRoute, setSavingRoute] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);

  // ── Load all rows ────────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${paths.apiBase}/admin/schema-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Load failed');

      // json.data is array of { route, fields, updated_at }
      const map: Record<string, SchemaFields> = {};
      for (const row of json.data as { route: string; fields: SchemaFields }[]) {
        map[row.route] = row.fields || {};
      }
      setFieldValues(map);
    } catch (err) {
      console.error('[SchemaLibrary] load error:', err);
      toast.error('Failed to load schema settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Field change handler ─────────────────────────────────────────────────────

  const handleFieldChange = (route: string, key: string, val: string) => {
    setFieldValues(prev => ({
      ...prev,
      [route]: { ...(prev[route] || {}), [key]: val },
    }));
  };

  // ── Save single route ────────────────────────────────────────────────────────

  const saveRoute = async (route: string) => {
    setSavingRoute(route);
    try {
      const token = getAuthToken();
      const encodedRoute = encodeURIComponent(route);
      const body = fieldValues[route] || {};

      const res = await fetch(`${paths.apiBase}/admin/schema-settings/${encodedRoute}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Save failed');
      toast.success(`Saved: ${route === '_global' ? 'Site-wide' : route}`);
    } catch (err) {
      console.error('[SchemaLibrary] save error:', err);
      toast.error(`Failed to save ${route}`);
    } finally {
      setSavingRoute(null);
    }
  };

  // ── Save all routes ──────────────────────────────────────────────────────────

  const saveAll = async () => {
    setSavingAll(true);
    const allRoutes = ['_global', ...ROUTE_CARDS.map(c => c.route)];
    let failed = 0;
    for (const route of allRoutes) {
      try {
        const token = getAuthToken();
        const encodedRoute = encodeURIComponent(route);
        const body = fieldValues[route] || {};
        const res = await fetch(`${paths.apiBase}/admin/schema-settings/${encodedRoute}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) failed++;
      } catch {
        failed++;
      }
    }
    setSavingAll(false);
    if (failed === 0) {
      toast.success('All schema settings saved');
    } else {
      toast.error(`${failed} routes failed to save`);
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-samudra-ink tracking-wide">Schema Settings</h2>
          <p className="text-sm text-samudra-ink-mute mt-1 font-body">
            Control schema.org JSON-LD fields injected into every page.
            <span className="ml-1 text-samudra-teal">Override → D1 entity data → PROPERTY_CONSTANTS.</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAll}
            className="h-9 border-samudra-ink/20 text-samudra-ink hover:bg-samudra-paper-soft"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={saveAll}
            disabled={savingAll}
            className="bg-samudra-teal hover:bg-samudra-teal/90 text-white h-9 px-4"
          >
            {savingAll ? (
              <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5" />
            )}
            Save All
          </Button>
        </div>
      </div>

      {/* Site-wide card (_global) — expanded by default */}
      <Card className="border border-samudra-teal/30 bg-samudra-paper shadow-sm">
        <CardHeader className="px-6 py-4 border-b border-samudra-ink/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-samudra-teal/10">
                <Globe className="h-4 w-4 text-samudra-teal" />
              </div>
              <div>
                <CardTitle className="font-display text-base text-samudra-ink tracking-wide">
                  Site-wide
                  <span className="ml-2 text-[10px] eyebrow text-samudra-teal font-normal tracking-widest">
                    used on every page
                  </span>
                </CardTitle>
                <p className="text-[11px] text-samudra-ink-mute mt-0.5 font-body">
                  LodgingBusiness, Restaurant, Spa — base fields. Route cards below can add page-level overrides.
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-6 space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-samudra-teal/5 border border-samudra-teal/20">
            <Info className="h-3.5 w-3.5 text-samudra-teal mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-samudra-ink-mute leading-relaxed">
              Fields left blank are auto-filled from D1 (<code className="font-mono text-[10px]">homepage_settings</code> / <code className="font-mono text-[10px]">rooms</code> tables).
              Populate only what you want to hard-override. <strong>No aggregateRating</strong> — Daniel ratified skip.
            </p>
          </div>

          {/* Group fields into sections */}
          {[
            { section: 'Identity', keys: ['brandName','legalName','origin'] },
            { section: 'Location & Coordinates', keys: ['geoLatitude','geoLongitude','addressStreet','addressLocality','addressRegion','addressPostal','addressCountry'] },
            { section: 'Operations', keys: ['checkinTime','checkoutTime','priceRange','languagesSpoken','paymentAccepted'] },
            { section: 'Contact & Social', keys: ['phone','email','socialFacebook','socialInstagram','socialTwitter','primaryImage'] },
            { section: 'Restaurant', keys: ['restaurantName','restaurantCuisine','restaurantPriceRange','restaurantBreakfastOpen','restaurantBreakfastClose','restaurantDinnerOpen','restaurantDinnerClose'] },
            { section: 'Spa', keys: ['spaName','spaOpen','spaClose'] },
          ].map(group => (
            <div key={group.section} className="space-y-3">
              <p className="eyebrow text-[10px] tracking-widest text-samudra-ink-mute uppercase">{group.section}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.keys.map(key => {
                  const def = GLOBAL_FIELDS.find(f => f.key === key);
                  if (!def) return null;
                  return (
                    <div key={key} className={def.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <FieldRow
                        def={def}
                        value={String(fieldValues['_global']?.[key] ?? '')}
                        onChange={(k, v) => handleFieldChange('_global', k, v)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2 border-t border-samudra-ink/5">
            <Button
              onClick={() => saveRoute('_global')}
              disabled={savingRoute === '_global'}
              size="sm"
              className="bg-samudra-teal hover:bg-samudra-teal/90 text-white h-9 px-4 text-sm"
            >
              {savingRoute === '_global' ? (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1.5" />
              )}
              Save Site-wide
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Per-route cards */}
      <div className="space-y-3">
        <p className="eyebrow text-[10px] tracking-widest text-samudra-ink-mute uppercase px-1">Per-route overrides</p>
        {ROUTE_CARDS.map(card => (
          <RouteCardPanel
            key={card.route}
            card={card}
            fields={card.fields}
            values={fieldValues[card.route] || {}}
            saving={savingRoute === card.route}
            defaultOpen={false}
            onFieldChange={handleFieldChange}
            onSave={saveRoute}
          />
        ))}
      </div>

      {/* Empty state hint */}
      <div className="p-4 rounded-xl border border-dashed border-samudra-ink/20 text-center">
        <p className="text-xs text-samudra-ink-mute font-body">
          Per-property clone: update <code className="font-mono text-[11px]">wrangler.toml</code> D1 binding + edit fields here — no code changes needed.
        </p>
      </div>
    </div>
  );
};

export default SchemaLibrarySection;
