import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { Edit, Trash2, Plus, Save, X, Hotel, Package, Users, Calendar } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  description: string;
  size: string;
  beds: string;
  features: string[];
  amenities: string[];
  available: boolean;
}

interface Package {
  id: string;
  name: string;
  description: string;
  package_type: string;
  base_price: number;
  discount_percentage: number;
  min_nights: number;
  max_nights: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  max_guests: number;
  includes: string[];
  terms: string;
}

interface Booking {
  id: number;
  room_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  special_requests: string;
}

const AdminManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRooms(),
        loadPackages(),
        loadBookings()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const loadRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data.success ? data.data : []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const loadPackages = async () => {
    try {
      const response = await fetch('/api/packages');
      const data = await response.json();
      setPackages(data.success ? data.data : []);
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      setBookings(data.success ? data.data : []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleSave = async (type: string, item: any) => {
    try {
      const method = editingItem && !isAddingNew ? 'PUT' : 'POST';
      const url = isAddingNew ? `/api/${type}` : `/api/${type}/${item.id}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `${type.slice(0, -1)} ${isAddingNew ? 'created' : 'updated'} successfully`,
        });
        
        // Reload data
        switch (type) {
          case 'rooms':
            await loadRooms();
            break;
          case 'packages':
            await loadPackages();
            break;
          case 'bookings':
            await loadBookings();
            break;
        }
        
        setEditingItem(null);
        setIsAddingNew(false);
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: `Failed to save ${type.slice(0, -1)}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (type: string, id: string | number) => {
    try {
      const response = await fetch(`/api/${type}/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `${type.slice(0, -1)} deleted successfully`,
        });
        
        // Reload data
        switch (type) {
          case 'rooms':
            await loadRooms();
            break;
          case 'packages':
            await loadPackages();
            break;
          case 'bookings':
            await loadBookings();
            break;
        }
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "Error",
        description: `Failed to delete ${type.slice(0, -1)}`,
        variant: "destructive",
      });
    }
  };

  const startEdit = (item: any) => {
    setEditingItem({ ...item });
    setIsAddingNew(false);
  };

  const startAdd = (type: string) => {
    const newItem = getEmptyItem(type);
    setEditingItem(newItem);
    setIsAddingNew(true);
  };

  const getEmptyItem = (type: string) => {
    switch (type) {
      case 'rooms':
        return {
          id: '',
          name: '',
          type: '',
          price: 0,
          capacity: 1,
          description: '',
          size: '',
          beds: '',
          features: [],
          amenities: [],
          available: true,
        };
      case 'packages':
        return {
          id: '',
          name: '',
          description: '',
          package_type: 'romantic',
          base_price: 0,
          discount_percentage: 0,
          min_nights: 1,
          max_nights: 7,
          valid_from: new Date().toISOString().split('T')[0],
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_active: true,
          max_guests: 2,
          includes: [],
          terms: '',
        };
      case 'bookings':
        return {
          id: 0,
          room_id: '',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          check_in: '',
          check_out: '',
          guests: 1,
          total_price: 0,
          status: 'confirmed',
          special_requests: '',
        };
      default:
        return {};
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setIsAddingNew(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-hotel-gold">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hotel-cream via-white to-hotel-cream">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-hotel-navy mb-2">Admin Management</h1>
              <p className="text-hotel-bronze">Manage all aspects of your booking system</p>
            </div>
            <div className="flex gap-2">
              <Link to="/admin" className="btn-hotel-secondary text-hotel-navy hover:bg-hotel-cream">
                ← Back to Bookings
              </Link>
              <Link to="/" className="btn-hotel-primary">
                View Site
              </Link>
            </div>
          </div>
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              Rooms
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          {/* Rooms Management */}
          <TabsContent value="rooms">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-hotel-navy">Room Management</CardTitle>
                    <CardDescription>Manage hotel rooms and their details</CardDescription>
                  </div>
                  <Button 
                    onClick={() => startAdd('rooms')} 
                    className="btn-hotel-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Room
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="p-4 border rounded-lg bg-white shadow-sm">
                      {editingItem && editingItem.id === room.id ? (
                        <RoomEditForm 
                          room={editingItem} 
                          onChange={setEditingItem}
                          onSave={() => handleSave('rooms', editingItem)}
                          onCancel={cancelEdit}
                        />
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-hotel-navy">{room.name}</h3>
                              <Badge variant={room.available ? "default" : "secondary"}>
                                {room.available ? "Available" : "Unavailable"}
                              </Badge>
                            </div>
                            <p className="text-hotel-bronze mb-2">{room.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Type:</span> {room.type}
                              </div>
                              <div>
                                <span className="font-medium">Price:</span> ${room.price}/night
                              </div>
                              <div>
                                <span className="font-medium">Capacity:</span> {room.capacity} guests
                              </div>
                              <div>
                                <span className="font-medium">Size:</span> {room.size}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(room)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Room</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{room.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete('rooms', room.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Add new room form */}
                  {isAddingNew && activeTab === 'rooms' && editingItem && (
                    <div className="p-4 border rounded-lg bg-hotel-cream/20">
                      <h3 className="text-lg font-semibold text-hotel-navy mb-4">Add New Room</h3>
                      <RoomEditForm 
                        room={editingItem} 
                        onChange={setEditingItem}
                        onSave={() => handleSave('rooms', editingItem)}
                        onCancel={cancelEdit}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Management */}
          <TabsContent value="packages">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-hotel-navy">Package Management</CardTitle>
                    <CardDescription>Manage booking packages and offers</CardDescription>
                  </div>
                  <Button 
                    onClick={() => startAdd('packages')} 
                    className="btn-hotel-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Package
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="p-4 border rounded-lg bg-white shadow-sm">
                      {editingItem && editingItem.id === pkg.id ? (
                        <PackageEditForm 
                          package={editingItem} 
                          onChange={setEditingItem}
                          onSave={() => handleSave('packages', editingItem)}
                          onCancel={cancelEdit}
                        />
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-hotel-navy">{pkg.name}</h3>
                              <Badge variant={pkg.is_active ? "default" : "secondary"}>
                                {pkg.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline" className="bg-hotel-gold/10 text-hotel-gold border-hotel-gold">
                                {pkg.discount_percentage}% OFF
                              </Badge>
                            </div>
                            <p className="text-hotel-bronze mb-2">{pkg.description}</p>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Type:</span> {pkg.package_type}
                              </div>
                              <div>
                                <span className="font-medium">Base Price:</span> ${pkg.base_price}
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span> {pkg.min_nights}-{pkg.max_nights} nights
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(pkg)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Package</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{pkg.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete('packages', pkg.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add new package form */}
                  {isAddingNew && activeTab === 'packages' && editingItem && (
                    <div className="p-4 border rounded-lg bg-hotel-cream/20">
                      <h3 className="text-lg font-semibold text-hotel-navy mb-4">Add New Package</h3>
                      <PackageEditForm 
                        package={editingItem} 
                        onChange={setEditingItem}
                        onSave={() => handleSave('packages', editingItem)}
                        onCancel={cancelEdit}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Management */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-hotel-navy">Booking Management</CardTitle>
                    <CardDescription>View and manage all bookings</CardDescription>
                  </div>
                  <Button 
                    onClick={() => startAdd('bookings')} 
                    className="btn-hotel-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Booking
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg bg-white shadow-sm">
                      {editingItem && editingItem.id === booking.id ? (
                        <BookingEditForm 
                          booking={editingItem} 
                          onChange={setEditingItem}
                          onSave={() => handleSave('bookings', editingItem)}
                          onCancel={cancelEdit}
                          rooms={rooms}
                        />
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-hotel-navy">
                                {booking.first_name} {booking.last_name}
                              </h3>
                              <Badge variant={
                                booking.status === 'confirmed' ? 'default' :
                                booking.status === 'pending' ? 'secondary' :
                                booking.status === 'cancelled' ? 'destructive' : 'outline'
                              }>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Email:</span> {booking.email}
                              </div>
                              <div>
                                <span className="font-medium">Phone:</span> {booking.phone}
                              </div>
                              <div>
                                <span className="font-medium">Check-in:</span> {booking.check_in}
                              </div>
                              <div>
                                <span className="font-medium">Check-out:</span> {booking.check_out}
                              </div>
                              <div>
                                <span className="font-medium">Guests:</span> {booking.guests}
                              </div>
                              <div>
                                <span className="font-medium">Total:</span> ${booking.total_price}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(booking)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this booking? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete('bookings', booking.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add new booking form */}
                  {isAddingNew && activeTab === 'bookings' && editingItem && (
                    <div className="p-4 border rounded-lg bg-hotel-cream/20">
                      <h3 className="text-lg font-semibold text-hotel-navy mb-4">Add New Booking</h3>
                      <BookingEditForm 
                        booking={editingItem} 
                        onChange={setEditingItem}
                        onSave={() => handleSave('bookings', editingItem)}
                        onCancel={cancelEdit}
                        rooms={rooms}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="text-hotel-navy">User Management</CardTitle>
                <CardDescription>Manage admin users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-hotel-bronze">
                  User management functionality coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Room Edit Form Component
const RoomEditForm: React.FC<{
  room: Room;
  onChange: (room: Room) => void;
  onSave: () => void;
  onCancel: () => void;
}> = ({ room, onChange, onSave, onCancel }) => {
  const handleFieldChange = (field: string, value: any) => {
    onChange({ ...room, [field]: value });
  };

  const handleArrayFieldChange = (field: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    onChange({ ...room, [field]: array });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Room Name</Label>
          <Input
            id="name"
            value={room.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="Enter room name"
          />
        </div>
        <div>
          <Label htmlFor="type">Room Type</Label>
          <Input
            id="type"
            value={room.type}
            onChange={(e) => handleFieldChange('type', e.target.value)}
            placeholder="e.g., Suite, Standard"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">Price per Night</Label>
          <Input
            id="price"
            type="number"
            value={room.price}
            onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            value={room.capacity}
            onChange={(e) => handleFieldChange('capacity', parseInt(e.target.value) || 1)}
            placeholder="Number of guests"
          />
        </div>
        <div>
          <Label htmlFor="size">Room Size</Label>
          <Input
            id="size"
            value={room.size}
            onChange={(e) => handleFieldChange('size', e.target.value)}
            placeholder="e.g., 30 sqm"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="beds">Bed Configuration</Label>
        <Input
          id="beds"
          value={room.beds}
          onChange={(e) => handleFieldChange('beds', e.target.value)}
          placeholder="e.g., 1 King Bed"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={room.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Room description"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="features">Features (comma-separated)</Label>
        <Input
          id="features"
          value={room.features.join(', ')}
          onChange={(e) => handleArrayFieldChange('features', e.target.value)}
          placeholder="City View, Balcony, Work Desk"
        />
      </div>

      <div>
        <Label htmlFor="amenities">Amenities (comma-separated)</Label>
        <Input
          id="amenities"
          value={room.amenities.join(', ')}
          onChange={(e) => handleArrayFieldChange('amenities', e.target.value)}
          placeholder="WiFi, TV, Air Conditioning"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="available"
          checked={room.available}
          onChange={(e) => handleFieldChange('available', e.target.checked)}
          className="rounded border-hotel-gold"
        />
        <Label htmlFor="available">Available for booking</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={onSave} className="btn-hotel-primary">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button onClick={onCancel} variant="outline">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Package Edit Form Component
const PackageEditForm: React.FC<{
  package: Package;
  onChange: (pkg: Package) => void;
  onSave: () => void;
  onCancel: () => void;
}> = ({ package: pkg, onChange, onSave, onCancel }) => {
  const handleFieldChange = (field: string, value: any) => {
    onChange({ ...pkg, [field]: value });
  };

  const handleArrayFieldChange = (field: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    onChange({ ...pkg, [field]: array });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Package Name</Label>
          <Input
            id="name"
            value={pkg.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="Enter package name"
          />
        </div>
        <div>
          <Label htmlFor="package_type">Package Type</Label>
          <Select value={pkg.package_type} onValueChange={(value) => handleFieldChange('package_type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="romantic">Romantic</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
              <SelectItem value="weekend">Weekend</SelectItem>
              <SelectItem value="holiday">Holiday</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={pkg.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Package description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="base_price">Base Price</Label>
          <Input
            id="base_price"
            type="number"
            value={pkg.base_price}
            onChange={(e) => handleFieldChange('base_price', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="discount_percentage">Discount %</Label>
          <Input
            id="discount_percentage"
            type="number"
            value={pkg.discount_percentage}
            onChange={(e) => handleFieldChange('discount_percentage', parseFloat(e.target.value) || 0)}
            placeholder="0"
            max="100"
          />
        </div>
        <div>
          <Label htmlFor="max_guests">Max Guests</Label>
          <Input
            id="max_guests"
            type="number"
            value={pkg.max_guests}
            onChange={(e) => handleFieldChange('max_guests', parseInt(e.target.value) || 1)}
            placeholder="Number of guests"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="min_nights">Min Nights</Label>
          <Input
            id="min_nights"
            type="number"
            value={pkg.min_nights}
            onChange={(e) => handleFieldChange('min_nights', parseInt(e.target.value) || 1)}
            placeholder="1"
          />
        </div>
        <div>
          <Label htmlFor="max_nights">Max Nights</Label>
          <Input
            id="max_nights"
            type="number"
            value={pkg.max_nights}
            onChange={(e) => handleFieldChange('max_nights', parseInt(e.target.value) || 7)}
            placeholder="7"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="valid_from">Valid From</Label>
          <Input
            id="valid_from"
            type="date"
            value={pkg.valid_from}
            onChange={(e) => handleFieldChange('valid_from', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="valid_until">Valid Until</Label>
          <Input
            id="valid_until"
            type="date"
            value={pkg.valid_until}
            onChange={(e) => handleFieldChange('valid_until', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="includes">Includes (comma-separated)</Label>
        <Textarea
          id="includes"
          value={(pkg.inclusions || pkg.includes || []).join(', ')}
          onChange={(e) => handleArrayFieldChange('inclusions', e.target.value)}
          placeholder="Breakfast, Welcome drink, Spa access"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="terms">Terms & Conditions</Label>
        <Textarea
          id="terms"
          value={pkg.terms}
          onChange={(e) => handleFieldChange('terms', e.target.value)}
          placeholder="Package terms and conditions"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={pkg.is_active}
          onChange={(e) => handleFieldChange('is_active', e.target.checked)}
          className="rounded border-hotel-gold"
        />
        <Label htmlFor="is_active">Package is active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={onSave} className="btn-hotel-primary">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button onClick={onCancel} variant="outline">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Booking Edit Form Component
const BookingEditForm: React.FC<{
  booking: Booking;
  onChange: (booking: Booking) => void;
  onSave: () => void;
  onCancel: () => void;
  rooms: Room[];
}> = ({ booking, onChange, onSave, onCancel, rooms }) => {
  const handleFieldChange = (field: string, value: any) => {
    onChange({ ...booking, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={booking.first_name}
            onChange={(e) => handleFieldChange('first_name', e.target.value)}
            placeholder="First name"
          />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={booking.last_name}
            onChange={(e) => handleFieldChange('last_name', e.target.value)}
            placeholder="Last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={booking.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={booking.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            placeholder="Phone number"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="room_id">Room</Label>
        <Select value={booking.room_id} onValueChange={(value) => handleFieldChange('room_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a room" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name} - ${room.price}/night
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="check_in">Check-in</Label>
          <Input
            id="check_in"
            type="date"
            value={booking.check_in}
            onChange={(e) => handleFieldChange('check_in', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="check_out">Check-out</Label>
          <Input
            id="check_out"
            type="date"
            value={booking.check_out}
            onChange={(e) => handleFieldChange('check_out', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="guests">Guests</Label>
          <Input
            id="guests"
            type="number"
            value={booking.guests}
            onChange={(e) => handleFieldChange('guests', parseInt(e.target.value) || 1)}
            placeholder="Number of guests"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="total_price">Total Price</Label>
          <Input
            id="total_price"
            type="number"
            value={booking.total_price}
            onChange={(e) => handleFieldChange('total_price', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={booking.status} onValueChange={(value) => handleFieldChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="checked_in">Checked In</SelectItem>
              <SelectItem value="checked_out">Checked Out</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="special_requests">Special Requests</Label>
        <Textarea
          id="special_requests"
          value={booking.special_requests}
          onChange={(e) => handleFieldChange('special_requests', e.target.value)}
          placeholder="Any special requests or notes"
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={onSave} className="btn-hotel-primary">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button onClick={onCancel} variant="outline">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AdminManagement;