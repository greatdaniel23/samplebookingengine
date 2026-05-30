import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Sparkles, X, Check, Pencil, Trash2, Building } from 'lucide-react';
import { paths } from '@/config/paths';
import { apiClient } from '@/utils/apiClient';
import MultipleRoomImageButton from './MultipleRoomImageButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Samudra shared input class — mirrors BookingsSection pattern
const samudraInput = "h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors";
const samudraSelect = "h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors";

const RoomsSection: React.FC = () => {
  const safeJSONParse = (jsonString: string | any, defaultValue: any = []) => {
    if (!jsonString) return defaultValue;
    if (Array.isArray(jsonString) || typeof jsonString === 'object') return jsonString;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Error parsing JSON:', e, jsonString);
      return defaultValue;
    }
  };

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteRoomTarget, setDeleteRoomTarget] = useState<any>(null);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [showRoomAmenitiesModal, setShowRoomAmenitiesModal] = useState(false);
  const [selectedRoomForAmenities, setSelectedRoomForAmenities] = useState<{ id: number, name: string } | null>(null);
  const [roomAmenities, setRoomAmenities] = useState<any[]>([]);
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    type: '',
    price: 0,
    capacity: 2,
    description: '',
    size: '',
    beds: '',
    available: true,
    features: [] as string[],
    amenities: [] as string[],
    images: [] as string[]
  });
  const [createFormData, setCreateFormData] = useState({
    name: '',
    type: 'Standard',
    price: 0,
    capacity: 2,
    description: '',
    size: '',
    beds: '',
    available: true,
    features: [] as string[],
    amenities: [] as string[],
    images: [] as string[]
  });

  useEffect(() => {
    fetchRooms();
    fetchAmenities();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const apiUrl = paths.buildApiUrl('rooms?all=true');


      const response = await fetch(apiUrl);


      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const data = await response.json();





      // Handle wrapped response format: {success: true, data: Array}
      let roomsArray = [];
      if (data && data.success && Array.isArray(data.data)) {
        roomsArray = data.data;

      } else if (Array.isArray(data)) {
        roomsArray = data;

      }

      if (roomsArray.length > 0) {
        // Normalize room data
        roomsArray = roomsArray.map((room: any) => ({
          ...room,
          available: room.is_active === 1
        }));
      }

      setRooms(roomsArray);

    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAmenities = async () => {
    try {
      const apiUrl = paths.buildApiUrl('amenities');
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success && data.amenities) {
        setAmenities(data.amenities || []);
      } else {
        setAmenities([]);
      }
    } catch (error) {
      console.error('Error fetching amenities:', error);
      setAmenities([]);
    }
  };

  const fetchRoomAmenities = async (roomId: number) => {
    try {
      const apiUrl = paths.buildApiUrl(`room-amenities?room_id=${roomId}`);
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setRoomAmenities(data.amenities || []);
      } else {
        setRoomAmenities([]);
      }
    } catch (error) {
      console.error('Error fetching room amenities:', error);
      setRoomAmenities([]);
    }
  };

  const addRoomAmenity = async (roomId: number, amenityId: number) => {
    try {
      const apiUrl = paths.buildApiUrl(`room-amenities?action=add&room_id=${roomId}&amenity_id=${amenityId}`);
      const response = await fetch(apiUrl, {
        method: 'GET'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) {
        // Refresh room amenities
        fetchRoomAmenities(roomId);
        // Optionally refresh rooms to update the main display
        fetchRooms();
      } else {
        throw new Error(result.error || 'Failed to add amenity');
      }
    } catch (error) {
      console.error('Error adding room amenity:', error);
      toast.error('Could not add amenity');
    }
  };

  const removeRoomAmenity = async (roomAmenityId: number) => {
    try {
      const apiUrl = paths.buildApiUrl(`room-amenities?action=remove&id=${roomAmenityId}`);
      const response = await fetch(apiUrl, {
        method: 'GET'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success && selectedRoomForAmenities) {
        // Refresh room amenities
        fetchRoomAmenities(selectedRoomForAmenities.id);
        // Optionally refresh rooms to update the main display
        fetchRooms();
      } else {
        throw new Error(result.error || 'Failed to remove amenity');
      }
    } catch (error) {
      console.error('Error removing room amenity:', error);
      toast.error('Could not remove amenity');
    }
  };

  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    try {
      const requestBody = {
        ...roomFormData,
        id: editingRoom.id,
        is_active: roomFormData.available
      };

      const result = await apiClient.put<any>(`/api/rooms/${editingRoom.id}`, requestBody);
      if (result.success) {
        toast.success('Suite saved');
        setEditingRoom(null);
        fetchRooms();
      } else {
        throw new Error(result.error || 'Failed to update room');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error(error instanceof Error ? error.message : 'Could not save suite');
    }
  };

  const deleteRoom = async (roomId: number) => {
    try {
      const result = await apiClient.deleteWithBody<any>(`/api/rooms/${roomId}`, { id: roomId });
      if (result.success) {
        toast.success('Suite removed');
        fetchRooms();
      } else {
        throw new Error(result.error || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error(error instanceof Error ? error.message : 'Could not remove suite');
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiClient.post<any>('/api/rooms', createFormData);
      if (result.success) {
        toast.success('Suite created');
        setShowCreateModal(false);
        setCreateFormData({
          name: '',
          type: 'Standard',
          price: 0,
          capacity: 2,
          description: '',
          size: '',
          beds: '',
          available: true,
          features: [] as string[],
          amenities: [] as string[],
          images: [] as string[]
        });
        fetchRooms();
      } else {
        throw new Error(result.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error(error instanceof Error ? error.message : 'Could not create suite');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Samudra section header — mirrors BookingsSection */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-script text-samudra-gold text-[28px] leading-none mb-2">suites of samudra</p>
          <h2 className="font-display text-[40px] font-light text-samudra-ink">Rooms</h2>
          <div className="h-px w-[60px] bg-samudra-ink mt-3" style={{ opacity: 0.4 }} />
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="h-11 bg-samudra-ink text-samudra-paper hover:bg-samudra-teal text-[11px] tracking-[0.3em] uppercase px-7 font-medium transition-colors"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Suite
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room, index) => (
          <div key={room.id || index} className="bg-samudra-paper border border-samudra-paper-deep card-accent-teal flex flex-col">
            <div className="p-5 flex-1">
              {/* Room header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="eyebrow text-samudra-ink-mute mb-1">Suite Inventory</p>
                  <h3 className="font-display text-[20px] font-light text-samudra-ink leading-tight">{room.name || 'Unnamed Suite'}</h3>
                </div>
                <span className={`ml-3 flex-shrink-0 eyebrow text-[10px] px-2 py-1 border ${room.available
                  ? 'border-samudra-teal text-samudra-teal'
                  : 'border-samudra-ink-mute text-samudra-ink-mute'
                }`}>
                  {room.available ? 'Available' : 'Inactive'}
                </span>
              </div>

              {/* Room details */}
              <div className="space-y-2 mt-4">
                {[
                  { label: 'Type',     value: room.type || 'N/A' },
                  { label: 'Price',    value: `Rp ${room.price?.toLocaleString('id-ID') || '0'} / night` },
                  { label: 'Capacity', value: room.capacity ? `${room.capacity} guests` : 'N/A' },
                  { label: 'Size',     value: room.size || 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-baseline">
                    <span className="eyebrow text-samudra-ink-mute">{label}</span>
                    <span className="text-[13px] text-samudra-ink is-numeric">{value}</span>
                  </div>
                ))}
              </div>

              {room.description && (
                <p className="mt-4 text-[13px] text-samudra-ink-mute line-clamp-2">{room.description}</p>
              )}

              {/* Room Image */}
              <div className="mt-4 pt-4 border-t border-samudra-paper-deep">
                <p className="eyebrow text-samudra-ink-mute mb-2">Room Images</p>
                <MultipleRoomImageButton
                  roomId={room.id}
                  onImageSelect={() => fetchRooms()}
                />
              </div>
            </div>

            {/* Card footer actions */}
            <div className="border-t border-samudra-paper-deep p-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 border-samudra-paper-deep text-samudra-ink hover:bg-samudra-paper-soft text-[11px] tracking-[0.2em] uppercase"
                style={{ fontFamily: 'var(--font-label)' }}
                onClick={() => {
                  setEditingRoom(room);
                  setRoomFormData({
                    name: room.name || '',
                    type: room.type || '',
                    price: parseFloat(room.price || 0),
                    capacity: parseInt(room.capacity || 2),
                    description: room.description || '',
                    size: room.size || '',
                    beds: room.beds || '',
                    available: room.available !== false,
                    features: safeJSONParse(room.features, []),
                    amenities: safeJSONParse(room.amenities, []),
                    images: safeJSONParse(room.images, [])
                  });
                }}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 border-samudra-paper-deep text-samudra-ink hover:bg-samudra-paper-soft text-[11px] tracking-[0.2em] uppercase"
                style={{ fontFamily: 'var(--font-label)' }}
                onClick={() => {
                  setSelectedRoomForAmenities({ id: room.id, name: room.name });
                  fetchRoomAmenities(room.id);
                  setShowRoomAmenitiesModal(true);
                }}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Amenities
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-[#7a3d31] hover:bg-[#7a3d31]/10"
                aria-label="Remove suite"
                onClick={() => setDeleteRoomTarget(room)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Room Dialog — Radix Dialog pattern */}
      <Dialog open={!!editingRoom} onOpenChange={(open) => { if (!open) setEditingRoom(null); }}>
        <DialogContent className="max-w-2xl bg-samudra-paper border border-samudra-paper-deep p-8"
          style={{ boxShadow: '0 32px 96px rgba(10,14,20,0.22), 0 4px 16px rgba(10,14,20,0.10)' }}>
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-[28px] font-light text-samudra-ink">Edit Suite</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <form onSubmit={handleEditRoom} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="eyebrow block mb-2">Suite Name *</label>
                  <input type="text" required value={roomFormData.name}
                    onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                    className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
                </div>
                <div>
                  <label className="eyebrow block mb-2">Room Type</label>
                  <input type="text" value={roomFormData.type}
                    onChange={(e) => setRoomFormData({ ...roomFormData, type: e.target.value })}
                    className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
                </div>
                <div>
                  <label className="eyebrow block mb-2">Price per Night *</label>
                  <input type="number" step="0.01" required value={roomFormData.price}
                    onChange={(e) => setRoomFormData({ ...roomFormData, price: parseFloat(e.target.value) })}
                    className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
                </div>
                <div>
                  <label className="eyebrow block mb-2">Capacity *</label>
                  <input type="number" required value={roomFormData.capacity}
                    onChange={(e) => setRoomFormData({ ...roomFormData, capacity: parseInt(e.target.value) })}
                    className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
                </div>
                <div>
                  <label className="eyebrow block mb-2">Size</label>
                  <input type="text" placeholder="e.g., 25 sqm" value={roomFormData.size}
                    onChange={(e) => setRoomFormData({ ...roomFormData, size: e.target.value })}
                    className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
                </div>
                <div>
                  <label className="eyebrow block mb-2">Beds <span className="text-samudra-ink-mute">(optional)</span></label>
                  <select value={roomFormData.beds}
                    onChange={(e) => setRoomFormData({ ...roomFormData, beds: e.target.value })}
                    className={samudraSelect} style={{ fontFamily: 'var(--font-label)' }}>
                    <option value="">Select configuration</option>
                    {['1 King Bed','1 Queen Bed','1 Double Bed','2 Single Beds','1 King Bed + 1 Single Bed',
                      '1 Queen Bed + 1 Single Bed','2 Double Beds','1 King Bed + 2 Single Beds',
                      '3 Single Beds','1 Sofa Bed','1 King Bed + 1 Sofa Bed','Bunk Beds'].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="eyebrow block mb-2">Description</label>
                <textarea value={roomFormData.description} rows={3}
                  onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                  className="w-full bg-samudra-paper border border-samudra-paper-deep px-3 py-2 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors resize-none"
                  style={{ fontFamily: 'var(--font-label)' }} />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="available" checked={roomFormData.available}
                  onChange={(e) => setRoomFormData({ ...roomFormData, available: e.target.checked })}
                  className="w-4 h-4 accent-samudra-teal" />
                <span className="eyebrow text-samudra-ink">Available for booking</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-samudra-paper-deep">
                <Button type="button" variant="outline"
                  className="h-11 border-samudra-ink text-samudra-ink bg-samudra-paper hover:bg-samudra-paper-soft text-[11px] tracking-[0.3em] uppercase px-6"
                  style={{ fontFamily: 'var(--font-label)' }}
                  onClick={() => setEditingRoom(null)}>Cancel</Button>
                <Button type="submit"
                  className="h-11 bg-samudra-ink text-samudra-paper hover:bg-samudra-teal text-[11px] tracking-[0.3em] uppercase px-6"
                  style={{ fontFamily: 'var(--font-label)' }}>Save Suite</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {rooms.length === 0 && (
        <div className="bg-samudra-paper border border-samudra-paper-deep p-8 text-center">
          <p className="font-script text-samudra-gold text-[28px] leading-none mb-3">no suites yet</p>
          <p className="text-[13px] text-samudra-ink-mute mb-6">Add your first suite to start managing availability.</p>
          <Button onClick={() => setShowCreateModal(true)}
            variant="outline"
            className="h-11 border-samudra-ink text-samudra-ink hover:bg-samudra-paper-soft text-[11px] tracking-[0.3em] uppercase px-7"
            style={{ fontFamily: 'var(--font-label)' }}>
            + Add Suite
          </Button>
        </div>
      )}

      {/* Create Room Dialog — Radix Dialog pattern */}
      <Dialog open={showCreateModal} onOpenChange={(open) => { if (!open) setShowCreateModal(false); }}>
        <DialogContent className="max-w-2xl bg-samudra-paper border border-samudra-paper-deep p-8"
          style={{ boxShadow: '0 32px 96px rgba(10,14,20,0.22), 0 4px 16px rgba(10,14,20,0.10)' }}>
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-[28px] font-light text-samudra-ink">Add New Suite</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="eyebrow block mb-2">Suite Name *</label>
                  <input type="text" required value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
                </div>
                <div>
                  <label className="eyebrow block mb-2">Room Type *</label>
                  <input type="text" required placeholder="e.g., Deluxe, Standard, Suite"
                    value={createFormData.type}
                    onChange={(e) => setCreateFormData({ ...createFormData, type: e.target.value })}
                    className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
                </div>
                <div>
                  <label className="eyebrow block mb-2">Price per Night *</label>
                  <input type="number" min="0" step="0.01" required value={createFormData.price}
                    onChange={(e) => setCreateFormData({ ...createFormData, price: parseFloat(e.target.value) || 0 })}
                    className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
                </div>
                <div>
                  <label className="eyebrow block mb-2">Capacity</label>
                  <input type="number" min="1" value={createFormData.capacity}
                    onChange={(e) => setCreateFormData({ ...createFormData, capacity: parseInt(e.target.value) || 2 })}
                    className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
                </div>
                <div>
                  <label className="eyebrow block mb-2">Size</label>
                  <input type="text" placeholder="e.g., 45m²" value={createFormData.size}
                    onChange={(e) => setCreateFormData({ ...createFormData, size: e.target.value })}
                    className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
                </div>
                <div>
                  <label className="eyebrow block mb-2">Beds <span className="text-samudra-ink-mute">(optional)</span></label>
                  <select value={createFormData.beds}
                    onChange={(e) => setCreateFormData({ ...createFormData, beds: e.target.value })}
                    className={samudraSelect} style={{ fontFamily: 'var(--font-label)' }}>
                    <option value="">Select configuration</option>
                    {['1 King Bed','1 Queen Bed','1 Double Bed','2 Single Beds','1 King Bed + 1 Single Bed',
                      '1 Queen Bed + 1 Single Bed','2 Double Beds','1 King Bed + 2 Single Beds',
                      '3 Single Beds','1 Sofa Bed','1 King Bed + 1 Sofa Bed','Bunk Beds'].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="eyebrow block mb-2">Description</label>
                <textarea value={createFormData.description} rows={3}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  className="w-full bg-samudra-paper border border-samudra-paper-deep px-3 py-2 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors resize-none"
                  style={{ fontFamily: 'var(--font-label)' }} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={createFormData.available}
                  onChange={(e) => setCreateFormData({ ...createFormData, available: e.target.checked })}
                  className="w-4 h-4 accent-samudra-teal" />
                <span className="eyebrow text-samudra-ink">Available for booking</span>
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-samudra-paper-deep">
                <Button type="button" variant="outline"
                  className="h-11 border-samudra-ink text-samudra-ink bg-samudra-paper hover:bg-samudra-paper-soft text-[11px] tracking-[0.3em] uppercase px-6"
                  style={{ fontFamily: 'var(--font-label)' }}
                  onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit"
                  className="h-11 bg-samudra-ink text-samudra-paper hover:bg-samudra-teal text-[11px] tracking-[0.3em] uppercase px-6"
                  style={{ fontFamily: 'var(--font-label)' }}>Create Suite</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Room Amenities Dialog — Radix Dialog pattern */}
      <Dialog open={showRoomAmenitiesModal} onOpenChange={(open) => { if (!open) setShowRoomAmenitiesModal(false); }}>
        <DialogContent className="max-w-4xl bg-samudra-paper border border-samudra-paper-deep p-8"
          style={{ boxShadow: '0 32px 96px rgba(10,14,20,0.22), 0 4px 16px rgba(10,14,20,0.10)' }}>
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-[28px] font-light text-samudra-ink">
              Suite Amenities
            </DialogTitle>
            {selectedRoomForAmenities && (
              <p className="eyebrow text-samudra-ink-mute mt-1">{selectedRoomForAmenities.name}</p>
            )}
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-1">
            {/* Available Amenities */}
            <div>
              <p className="eyebrow text-samudra-ink-mute mb-3">Available to Add</p>
              {amenities.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="h-10 w-10 mx-auto mb-3 text-samudra-ink-mute opacity-40" />
                  <p className="text-[13px] text-samudra-ink-mute">No amenities available. Create some in the Amenities section first.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {amenities.map((amenity) => {
                    const isAssigned = roomAmenities.some(ra => ra.amenity_id === amenity.id);
                    return (
                      <div key={amenity.id} className={`flex items-center justify-between p-3 border ${isAssigned ? 'border-samudra-teal bg-samudra-paper-soft' : 'border-samudra-paper-deep'} transition-colors`}>
                        <div>
                          <p className="text-[14px] text-samudra-ink">{amenity.name}</p>
                          {amenity.category && <p className="eyebrow text-samudra-ink-mute">{amenity.category}</p>}
                        </div>
                        <button
                          onClick={() => addRoomAmenity(selectedRoomForAmenities!.id, amenity.id)}
                          disabled={isAssigned}
                          className={`eyebrow text-[10px] px-3 py-1 border transition-colors ${isAssigned
                            ? 'border-samudra-teal text-samudra-teal cursor-default'
                            : 'border-samudra-ink text-samudra-ink hover:bg-samudra-ink hover:text-samudra-paper'
                          }`}
                          style={{ fontFamily: 'var(--font-label)' }}
                        >
                          {isAssigned ? 'Added' : 'Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Assigned Amenities */}
            <div>
              <p className="eyebrow text-samudra-ink-mute mb-3">Assigned to Suite</p>
              {roomAmenities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[13px] text-samudra-ink-mute">No amenities assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {roomAmenities.map((roomAmenity) => {
                    const amenity = amenities.find(a => a.id === roomAmenity.amenity_id);
                    return (
                      <div key={roomAmenity.id} className="flex items-center justify-between p-3 border border-samudra-teal bg-samudra-paper-soft">
                        <div>
                          <p className="text-[14px] text-samudra-ink">{amenity?.name || 'Unknown'}</p>
                          {amenity?.category && <p className="eyebrow text-samudra-ink-mute">{amenity.category}</p>}
                        </div>
                        <button
                          onClick={() => removeRoomAmenity(roomAmenity.id)}
                          className="eyebrow text-[10px] px-3 py-1 border border-[#7a3d31] text-[#7a3d31] hover:bg-[#7a3d31] hover:text-samudra-paper transition-colors"
                          style={{ fontFamily: 'var(--font-label)' }}
                          aria-label={`Remove ${amenity?.name}`}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Suite Confirm */}
      <AlertDialog open={!!deleteRoomTarget} onOpenChange={(open) => { if (!open) setDeleteRoomTarget(null); }}>
        <AlertDialogContent className="bg-samudra-paper border border-samudra-paper-deep">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-[22px] font-normal text-samudra-ink">Remove suite?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-samudra-ink-mute" style={{ fontFamily: 'var(--font-label)' }}>
              This will hide {deleteRoomTarget?.name} from booking. Existing bookings will remain intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel className="h-11 border border-samudra-ink text-samudra-ink bg-samudra-paper text-[11px] tracking-[0.3em] uppercase px-6" style={{ fontFamily: 'var(--font-label)' }}>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteRoomTarget) { deleteRoom(deleteRoomTarget.id); setDeleteRoomTarget(null); } }}
              className="h-11 bg-[#7a3d31] text-samudra-paper text-[11px] tracking-[0.3em] uppercase px-6" style={{ fontFamily: 'var(--font-label)' }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoomsSection;
