import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, X, Check, Pencil, Trash2, Building } from 'lucide-react';
import { paths } from '@/config/paths';
import MultipleRoomImageButton from './MultipleRoomImageButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
      alert('Error adding amenity: ' + error);
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
      alert('Error removing amenity: ' + error);
    }
  };

  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    try {
      // Include the room ID in the request body as expected by the API
      const requestBody = {
        ...roomFormData,
        id: editingRoom.id,
        is_active: roomFormData.available
      };

      const response = await fetch(paths.buildApiUrl(`rooms/${editingRoom.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) {
        alert('Room updated successfully!');
        setEditingRoom(null);
        fetchRooms();
      } else {
        throw new Error(result.error || 'Failed to update room');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Error updating room: ' + error);
    }
  };

  const deleteRoom = async (roomId: number) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const response = await fetch(paths.buildApiUrl(`rooms/${roomId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: roomId })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) {
        alert('Room deleted successfully!');
        fetchRooms();
      } else {
        throw new Error(result.error || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Error deleting room: ' + error);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = paths.buildApiUrl('rooms');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createFormData)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) {
        alert('Room created successfully!');
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
        fetchRooms(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error creating room: ' + error);
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
      {/* Room Inventory Concept Header */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Building className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold mb-2">🏨 Real Inventory Control</h3>
              <p className="text-sm text-muted-foreground">
                <strong>Rooms are the real inventory</strong> that controls all booking availability.
                Each room type has a total inventory count. When rooms are booked, availability decreases.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                💡 <strong>Business Logic:</strong> Room availability controls all package availability → No rooms = No sales tools available
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Room Inventory Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage actual inventory - rooms control all availability</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Room Type
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room, index) => (
          <Card key={room.id || index}>
            <CardContent className="pt-6">
              {/* Room Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">🏠 Room Inventory</Badge>
                    <Badge variant={room.available ? 'default' : 'destructive'}>
                      {room.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold">{room.name || 'Unnamed Room'}</h3>
                </div>
              </div>

              {/* Room Details */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span><strong>Room Type:</strong></span>
                  <span>{room.type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Price per Night:</strong></span>
                  <span className="font-semibold text-foreground">${room.price || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Guest Capacity:</strong></span>
                  <span>{room.capacity || 'N/A'} guests</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Room Size:</strong></span>
                  <span>{room.size || 'N/A'}</span>
                </div>
              </div>

              {/* Business Logic Explanation */}
              <div className="mt-4 p-3 bg-gray-100 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-gray-700">
                    <p className="font-medium">Real Inventory:</p>
                    <p>This room controls availability for all packages and sales tools based on it.</p>
                  </div>
                </div>
              </div>

              {room.description && (
                <p className="mt-4 text-sm text-gray-600 line-clamp-3">{room.description}</p>
              )}

              {/* Room Image Selection */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Image</label>
                <MultipleRoomImageButton
                  roomId={room.id}
                  onImageSelect={(imageData) => {
                    // Refresh room data to show updated image
                    fetchRooms();
                  }}
                />
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
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
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedRoomForAmenities({ id: room.id, name: room.name });
                    fetchRoomAmenities(room.id);
                    setShowRoomAmenitiesModal(true);
                  }}
                  title="Manage Room Amenities"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Amenities
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRoom(room.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Room</h3>
              <button
                onClick={() => setEditingRoom(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditRoom} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                  <input
                    type="text"
                    value={roomFormData.name}
                    onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <input
                    type="text"
                    value={roomFormData.type}
                    onChange={(e) => setRoomFormData({ ...roomFormData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night</label>
                  <input
                    type="number"
                    step="0.01"
                    value={roomFormData.price}
                    onChange={(e) => setRoomFormData({ ...roomFormData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={roomFormData.capacity}
                    onChange={(e) => setRoomFormData({ ...roomFormData, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <input
                    type="text"
                    value={roomFormData.size}
                    onChange={(e) => setRoomFormData({ ...roomFormData, size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 25 sqm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beds <span className="text-gray-400 text-xs">(optional)</span></label>
                  <select
                    value={roomFormData.beds}
                    onChange={(e) => setRoomFormData({ ...roomFormData, beds: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select bed configuration (optional)</option>
                    <option value="1 King Bed">1 King Bed</option>
                    <option value="1 Queen Bed">1 Queen Bed</option>
                    <option value="1 Double Bed">1 Double Bed</option>
                    <option value="2 Single Beds">2 Single Beds</option>
                    <option value="1 King Bed + 1 Single Bed">1 King Bed + 1 Single Bed</option>
                    <option value="1 Queen Bed + 1 Single Bed">1 Queen Bed + 1 Single Bed</option>
                    <option value="2 Double Beds">2 Double Beds</option>
                    <option value="1 King Bed + 2 Single Beds">1 King Bed + 2 Single Beds</option>
                    <option value="3 Single Beds">3 Single Beds</option>
                    <option value="1 Sofa Bed">1 Sofa Bed</option>
                    <option value="1 King Bed + 1 Sofa Bed">1 King Bed + 1 Sofa Bed</option>
                    <option value="Bunk Beds">Bunk Beds</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={roomFormData.description}
                  onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  checked={roomFormData.available}
                  onChange={(e) => setRoomFormData({ ...roomFormData, available: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="available" className="text-sm font-medium text-gray-700">Available for booking</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Update Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rooms.length === 0 && (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p>No rooms found</p>
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Room</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                  <input
                    type="text"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <input
                    type="text"
                    value={createFormData.type}
                    onChange={(e) => setCreateFormData({ ...createFormData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Deluxe, Standard, Suite"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night</label>
                  <input
                    type="number"
                    value={createFormData.price}
                    onChange={(e) => setCreateFormData({ ...createFormData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={createFormData.capacity}
                    onChange={(e) => setCreateFormData({ ...createFormData, capacity: parseInt(e.target.value) || 2 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <input
                    type="text"
                    value={createFormData.size}
                    onChange={(e) => setCreateFormData({ ...createFormData, size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 45m²"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beds <span className="text-gray-400 text-xs">(optional)</span></label>
                <select
                  value={createFormData.beds}
                  onChange={(e) => setCreateFormData({ ...createFormData, beds: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select bed configuration (optional)</option>
                  <option value="1 King Bed">1 King Bed</option>
                  <option value="1 Queen Bed">1 Queen Bed</option>
                  <option value="1 Double Bed">1 Double Bed</option>
                  <option value="2 Single Beds">2 Single Beds</option>
                  <option value="1 King Bed + 1 Single Bed">1 King Bed + 1 Single Bed</option>
                  <option value="1 Queen Bed + 1 Single Bed">1 Queen Bed + 1 Single Bed</option>
                  <option value="2 Double Beds">2 Double Beds</option>
                  <option value="1 King Bed + 2 Single Beds">1 King Bed + 2 Single Beds</option>
                  <option value="3 Single Beds">3 Single Beds</option>
                  <option value="1 Sofa Bed">1 Sofa Bed</option>
                  <option value="1 King Bed + 1 Sofa Bed">1 King Bed + 1 Sofa Bed</option>
                  <option value="Bunk Beds">Bunk Beds</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={roomFormData.available}
                    onChange={(e) => setRoomFormData({ ...roomFormData, available: e.target.checked })}
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Available for booking</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Amenities Management Modal */}
      {showRoomAmenitiesModal && selectedRoomForAmenities && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Manage Room Amenities</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Add amenities to <strong>{selectedRoomForAmenities.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowRoomAmenitiesModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Amenities */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <Plus className="h-5 w-5 mr-2 text-gray-600" />
                    Available Amenities
                  </h4>

                  {amenities.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No amenities available</p>
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                        <p className="text-xs text-gray-600 font-medium mb-2">Quick Setup:</p>
                        <p className="text-xs text-gray-600">1. Go to "Amenities" tab in admin panel</p>
                        <p className="text-xs text-gray-600">2. Create amenities like "Swimming Pool", "Free WiFi", etc.</p>
                        <p className="text-xs text-gray-600">3. Return here to add them to rooms</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {amenities.map((amenity) => {
                        const isAssigned = roomAmenities.some(ra => ra.amenity_id === amenity.id);
                        return (
                          <div key={amenity.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{amenity.icon || '⭐'}</div>
                              <div>
                                <p className="font-medium text-gray-800">{amenity.name}</p>
                                {amenity.category && (
                                  <p className="text-xs text-gray-500">{amenity.category}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => addRoomAmenity(selectedRoomForAmenities.id, amenity.id)}
                              disabled={isAssigned}
                              className={`px-3 py-1 rounded text-sm transition-colors ${isAssigned
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : 'bg-gray-600 text-white hover:bg-gray-700'
                                }`}
                            >
                              {isAssigned ? (
                                <>
                                  <Check className="w-4 h-4 inline mr-1" />
                                  Added
                                </>
                              ) : (
                                'Add'
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Assigned Amenities */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Room Amenities</h4>
                  {roomAmenities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No amenities assigned to this room yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {roomAmenities.map((roomAmenity) => {
                        const amenity = amenities.find(a => a.id === roomAmenity.amenity_id);
                        return (
                          <div key={roomAmenity.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{amenity?.icon || '⭐'}</div>
                              <div>
                                <p className="font-medium text-gray-800">{amenity?.name || 'Unknown'}</p>
                                {amenity?.category && (
                                  <p className="text-xs text-gray-500">{amenity.category}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => removeRoomAmenity(roomAmenity.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsSection;
