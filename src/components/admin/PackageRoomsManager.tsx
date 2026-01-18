import React, { useEffect, useMemo, useState } from 'react';
import { X, Plus, Trash2, Edit, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';
import { paths } from '@/config/paths';

interface PackageRoomsManagerProps {
  packageId: number;
  packageName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface RoomItem {
  id: string;
  name: string;
  price?: number;
  capacity?: number;
  available?: boolean;
}

interface RelationshipItem {
  id: number;
  package_id: number;
  room_id: string;
  room_name?: string;
  is_default: number;
  price_adjustment: number;
  adjustment_type: 'fixed' | 'percentage';
  max_occupancy_override?: number | null;
  availability_priority: number;
  is_active: number;
  description?: string | null;
}

export const PackageRoomsManager: React.FC<PackageRoomsManagerProps> = ({ packageId, packageName, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allRooms, setAllRooms] = useState<RoomItem[]>([]);
  const [relationships, setRelationships] = useState<RelationshipItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const [form, setForm] = useState<{
    room_id: string;
    is_default: boolean;
    price_adjustment: number;
    adjustment_type: 'fixed' | 'percentage';
    availability_priority: number;
    max_occupancy_override?: number | null;
    description?: string;
  }>({
    room_id: '',
    is_default: false,
    price_adjustment: 0,
    adjustment_type: 'fixed',
    availability_priority: 1,
    max_occupancy_override: null,
    description: ''
  });

  const availableRoomsForAdd = useMemo(() => {
    const existingIds = new Set(relationships.map(r => r.room_id));
    return allRooms.filter(r => !existingIds.has(r.id));
  }, [allRooms, relationships]);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Load all rooms
        const roomsResp = await fetch(paths.buildApiUrl('rooms'));
        const roomsJson = await roomsResp.json();
        const rooms = roomsJson?.data ?? roomsJson ?? [];
        setAllRooms(Array.isArray(rooms) ? rooms : []);

        // Load existing relationships
        const relResp = await fetch(paths.buildApiUrl(`packages/${packageId}/rooms?include_inactive=${showInactive ? '1' : '0'}`));
        const relJson = await relResp.json();
        let relData = Array.isArray(relJson?.data) ? relJson.data : (Array.isArray(relJson) ? relJson : []);

        // Fallback: if no relationships, derive from base_room_id in packages.php
        if (!relData || relData.length === 0) {
          const pkgResp = await fetch(paths.buildApiUrl(`packages/${packageId}`));
          const pkgJson = await pkgResp.json();
          const pkg = pkgJson?.data ?? null;
          if (pkg && pkg.base_room_id) {
            const baseRoom = (Array.isArray(rooms) ? rooms : []).find((r: any) => r.id === pkg.base_room_id);
            const pseudo: RelationshipItem = {
              id: 0,
              package_id: packageId,
              room_id: pkg.base_room_id,
              room_name: baseRoom?.name || pkg.base_room_id,
              is_default: 1,
              price_adjustment: 0,
              adjustment_type: 'fixed',
              max_occupancy_override: null,
              availability_priority: 1,
              is_active: 1,
              description: 'Base room from package (implicit)'
            };
            relData = [pseudo];
          }
        }

        setRelationships(relData);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, packageId, showInactive]);

  const addRelationship = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch(paths.buildApiUrl(`packages/${packageId}/rooms`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: packageId,
          room_id: form.room_id,
          is_default: form.is_default ? 1 : 0,
          price_adjustment: form.price_adjustment,
          adjustment_type: form.adjustment_type,
          availability_priority: form.availability_priority,
          max_occupancy_override: form.max_occupancy_override,
          description: form.description
        })
      });
      const json = await resp.json();
      if (!json.success) {
        // If relationship already exists (409), perform an update instead
        if (resp.status === 409 || (json.error && /already exists/i.test(json.error))) {
          const existing = relationships.find(r => r.room_id === form.room_id);
          if (existing) {
            await updateRelationship(existing.id, {
              is_default: form.is_default ? 1 : 0,
              price_adjustment: form.price_adjustment,
              adjustment_type: form.adjustment_type,
              availability_priority: form.availability_priority,
              max_occupancy_override: form.max_occupancy_override ?? null,
              description: form.description ?? null
            });
          } else {
            throw new Error(json.error || 'Relationship already exists');
          }
        } else {
          throw new Error(json.error || 'Failed to add');
        }
      }
      // Reload relationships
      const relResp = await fetch(paths.buildApiUrl(`packages/${packageId}/rooms?include_inactive=${showInactive ? '1' : '0'}`));
      const relJson = await relResp.json();
      const relData = Array.isArray(relJson?.data) ? relJson.data : (Array.isArray(relJson) ? relJson : []);
      setRelationships(relData);
      // Reset form
      setForm(prev => ({ ...prev, room_id: '', is_default: false, price_adjustment: 0, adjustment_type: 'fixed', availability_priority: 1 }));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to add relationship');
    } finally {
      setLoading(false);
    }
  };

  const updateRelationship = async (id: number, changes: Partial<RelationshipItem>) => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch(paths.buildApiUrl(`packages/rooms/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes)
      });
      const json = await resp.json();
      if (!json.success) throw new Error(json.error || 'Failed to update');
      const relResp = await fetch(paths.buildApiUrl(`packages/${packageId}/rooms?include_inactive=${showInactive ? '1' : '0'}`));
      const relJson = await relResp.json();
      const relData = Array.isArray(relJson?.data) ? relJson.data : (Array.isArray(relJson) ? relJson : []);
      setRelationships(relData);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update relationship');
    } finally {
      setLoading(false);
    }
  };

  const removeRelationship = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch(paths.buildApiUrl(`packages/rooms/${id}`), { method: 'DELETE' });
      const json = await resp.json();
      if (!json.success) throw new Error(json.error || 'Failed to remove');
      const relResp = await fetch(paths.buildApiUrl(`packages/${packageId}/rooms`));
      const relJson = await relResp.json();
      setRelationships(relJson?.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to remove relationship');
    } finally {
      setLoading(false);
    }
  };

  const linkBaseRoomIfShown = async () => {
    try {
      const base = relationships.find(r => r.id === 0);
      if (!base) return;
      setLoading(true);
      setError(null);
      const resp = await fetch(paths.buildApiUrl(`packages/${packageId}/rooms`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: packageId,
          room_id: base.room_id,
          is_default: 1,
          price_adjustment: 0,
          adjustment_type: 'fixed',
          availability_priority: 1,
          max_occupancy_override: null,
          description: 'Linked from base room'
        })
      });
      const json = await resp.json();
      if (!json.success && resp.status !== 409) throw new Error(json.error || 'Failed to link base room');
      // On 409, ensure it is active and default
      if (resp.status === 409) {
        const relResp = await fetch(paths.buildApiUrl(`packages/${packageId}/rooms?include_inactive=1`));
        const relJson = await relResp.json();
        const existing = (relJson?.data ?? []).find((r: any) => r.room_id === base.room_id);
        if (existing) {
          await updateRelationship(existing.id, { is_active: 1, is_default: 1, availability_priority: 1 });
        }
      }
      const relResp = await fetch(paths.buildApiUrl(`packages/${packageId}/rooms?include_inactive=${showInactive ? '1' : '0'}`));
      const relJson = await relResp.json();
      const relData = Array.isArray(relJson?.data) ? relJson.data : (Array.isArray(relJson) ? relJson : []);
      setRelationships(relData);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to link base room');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Manage Package Rooms</h3>
            <p className="text-sm text-gray-600">Package: {packageName}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-gray-600">
            <span className="inline-block mr-3">Linked rooms: {relationships.length}</span>
            {loading && <span className="inline-block text-blue-600">Loading…</span>}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300"
            />
            Show inactive
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Existing Relationships */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Current Room Options</h4>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Room</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Default</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Adjustment</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Priority</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Active</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {relationships.map(rel => (
                    <tr key={rel.id}>
                      <td className="px-3 py-2 text-sm text-gray-800">{rel.room_name || rel.room_id}</td>
                      <td className="px-3 py-2 text-sm">{rel.is_default ? <CheckCircle className="w-4 h-4 text-green-600" /> : '-'}</td>
                      <td className="px-3 py-2 text-sm">{rel.adjustment_type === 'percentage' ? `${parseFloat(rel.price_adjustment || 0)}%` : `Rp ${Number(rel.price_adjustment || 0).toLocaleString('id-ID')}`}</td>
                      <td className="px-3 py-2 text-sm">{rel.adjustment_type}</td>
                      <td className="px-3 py-2 text-sm">{rel.availability_priority}</td>
                      <td className="px-3 py-2 text-sm">{rel.is_active ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex gap-1 justify-end flex-wrap">
                          <button
                            onClick={() => updateRelationship(rel.id, { is_default: 1 })}
                            disabled={rel.is_default || loading}
                            className={`px-2 py-1 text-xs rounded ${rel.is_default ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                          >Set Default</button>
                          <button
                            onClick={() => updateRelationship(rel.id, { is_active: rel.is_active ? 0 : 1 })}
                            disabled={loading}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                          >{rel.is_active ? 'Disable' : 'Enable'}</button>
                          <button
                            onClick={() => removeRelationship(rel.id)}
                            disabled={loading}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          ><Trash2 className="w-3 h-3 inline mr-1" />Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {relationships.length === 0 && (
                    <tr>
                      <td className="px-3 py-3 text-sm text-gray-500" colSpan={7}>
                        No rooms linked to this package{showInactive ? '' : ' (active)'} yet.
                        <div className="mt-1 text-xs text-gray-400">If this package is connected but not visible, try enabling "Show inactive".</div>
                      </td>
                    </tr>
                  )}
                  {relationships.length === 1 && relationships[0].id === 0 && (
                    <tr>
                      <td className="px-3 py-3 text-sm" colSpan={7}>
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-center justify-between">
                          <div>
                            <div className="text-gray-800">Base room detected: <span className="font-medium">{relationships[0].room_name || relationships[0].room_id}</span></div>
                            <div className="text-xs text-gray-500">Link this base room to make it an explicit option for the package.</div>
                          </div>
                          <button onClick={linkBaseRoomIfShown} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
                            Link Base Room
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Relationship */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Add Room Option</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <select
                  value={form.room_id}
                  onChange={(e) => setForm({ ...form, room_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">Select room</option>
                  {availableRoomsForAdd.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Adjustment</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    value={form.price_adjustment}
                    onChange={(e) => setForm({ ...form, price_adjustment: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    value={form.adjustment_type}
                    onChange={(e) => setForm({ ...form, adjustment_type: e.target.value as 'fixed' | 'percentage' })}
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    value={form.availability_priority}
                    onChange={(e) => setForm({ ...form, availability_priority: parseInt(e.target.value) || 1 })}
                    min={1}
                  />
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.is_default}
                      onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Set as default
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Occupancy Override (optional)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  value={form.max_occupancy_override ?? ''}
                  onChange={(e) => setForm({ ...form, max_occupancy_override: e.target.value ? parseInt(e.target.value) : null })}
                  min={1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={addRelationship}
                  disabled={!form.room_id || loading}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 inline mr-1" /> Add Room Option
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <ChevronDown className="w-4 h-4" />
            <span>Changes apply immediately to package {packageName}</span>
          </div>
          <button onClick={onClose} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Close</button>
        </div>
      </div>
    </div>
  );
};
