import React, { useState, useEffect } from 'react';
import { paths } from '@/config/paths';

const BookingsSection: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    check_in: '',
    check_out: '',
    room_id: '',
    guests: 1,
    adults: 1,
    children: 0,
    total_price: 0,
    status: 'confirmed',
    special_requests: ''
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const apiUrl = paths.buildApiUrl('bookings.php');
      console.log('🔍 Fetching bookings from:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('📡 Bookings API Response:', response.status, response.statusText);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      console.log('📊 Bookings Raw Data:', data);
      console.log('📊 Bookings Data Type:', typeof data);
      console.log('📊 Bookings Is Array:', Array.isArray(data));
      console.log('📊 Bookings Length:', Array.isArray(data) ? data.length : 'Not an array');
      
      // Handle wrapped response format: {success: true, data: Array}
      let bookingsArray = [];
      if (data && data.success && Array.isArray(data.data)) {
        bookingsArray = data.data;
        console.log('📊 Extracted from wrapper - Bookings Length:', bookingsArray.length);
      } else if (Array.isArray(data)) {
        bookingsArray = data;
        console.log('📊 Direct array - Bookings Length:', bookingsArray.length);
      }
      
      if (bookingsArray.length > 0) {
        console.log('📊 First Booking Sample:', bookingsArray[0]);
        console.log('📊 First Booking Keys:', Object.keys(bookingsArray[0]));
      }
      
      setBookings(bookingsArray);
      console.log('✅ Bookings set to state:', bookingsArray.length, 'items');
      
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      console.error('❌ Error details:', error.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      const response = await fetch(paths.buildApiUrl(`bookings.php?id=${id}`), {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      alert('Booking deleted successfully!');
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking: ' + error);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Keep guests in sync with adults + children
      if (field === 'adults' || field === 'children') {
        updated.guests = (field === 'adults' ? value : updated.adults) + (field === 'children' ? value : updated.children);
      }
      return updated;
    });
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(paths.buildApiUrl('bookings.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      if (result.success) {
        alert('Booking created successfully!');
        setShowAddForm(false);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          check_in: '',
          check_out: '',
          room_id: '',
          guests: 1,
          adults: 1,
          children: 0,
          total_price: 0,
          status: 'confirmed',
          special_requests: ''
        });
        fetchBookings();
      } else {
        throw new Error(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking: ' + error);
    }
  };

  const handleEditBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    
    try {
      // Include the booking ID in the request body as expected by the API
      const requestBody = {
        ...formData,
        id: editingBooking.id
      };
      
      const response = await fetch(paths.buildApiUrl(`bookings.php`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      if (result.success) {
        alert('Booking updated successfully!');
        setEditingBooking(null);
        fetchBookings();
      } else {
        throw new Error(result.error || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking: ' + error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'checked_in': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Bookings Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Booking
        </button>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Bookings ({bookings.length})</h3>
        </div>
        
        {bookings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
            </svg>
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking, index) => (
                  <tr key={booking.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.guest_name || booking.name || 
                           (booking.first_name ? `${booking.first_name} ${booking.last_name || ''}`.trim() : '') || 
                           'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{booking.email || booking.guest_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.room_name || `Room ${booking.room_id}` || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>Check-in: {booking.check_in || 'N/A'}</div>
                        <div>Check-out: {booking.check_out || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${booking.total_price || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          const guestName = booking.guest_name || booking.name || 
                                           (booking.first_name ? `${booking.first_name} ${booking.last_name || ''}`.trim() : '');
                          const [firstName, ...lastNameParts] = guestName.split(' ');
                          
                          setEditingBooking(booking);
                          setFormData({
                            first_name: booking.first_name || firstName || '',
                            last_name: booking.last_name || lastNameParts.join(' ') || '',
                            email: booking.email || booking.guest_email || '',
                            phone: booking.phone || booking.guest_phone || '',
                            check_in: booking.check_in || '',
                            check_out: booking.check_out || '',
                            room_id: booking.room_id || '',
                            guests: booking.guests || booking.adults + booking.children || 1,
                            adults: booking.adults || booking.guests || 1,
                            children: booking.children || 0,
                            total_price: parseFloat(booking.total_price || booking.total_amount || 0),
                            status: booking.status || 'confirmed',
                            special_requests: booking.special_requests || ''
                          });
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteBooking(booking.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Booking Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Booking</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddBooking} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name*</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => handleFormChange('first_name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleFormChange('last_name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email*</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Check-in Date*</label>
                    <input
                      type="date"
                      required
                      value={formData.check_in}
                      onChange={(e) => handleFormChange('check_in', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Check-out Date*</label>
                    <input
                      type="date"
                      required
                      value={formData.check_out}
                      onChange={(e) => handleFormChange('check_out', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Room*</label>
                    <select
                      required
                      value={formData.room_id}
                      onChange={(e) => handleFormChange('room_id', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select a room</option>
                      <option value="deluxe-suite">Deluxe Suite</option>
                      <option value="economy-room">Economy Room</option>
                      <option value="family-room">Family Room</option>
                      <option value="master-suite">Master Suite</option>
                      <option value="standard-room">Standard Room</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adults*</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.adults}
                      onChange={(e) => handleFormChange('adults', parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Children</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.children}
                      onChange={(e) => handleFormChange('children', parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Price*</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.total_price}
                      onChange={(e) => handleFormChange('total_price', parseFloat(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Special Requests</label>
                  <textarea
                    value={formData.special_requests}
                    onChange={(e) => handleFormChange('special_requests', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Any special requests..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        first_name: '',
                        last_name: '',
                        email: '',
                        phone: '',
                        check_in: '',
                        check_out: '',
                        room_id: '',
                        guests: 1,
                        adults: 1,
                        children: 0,
                        total_price: 0,
                        status: 'confirmed',
                        special_requests: ''
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Create Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Booking #{editingBooking.id}</h3>
                <button
                  onClick={() => setEditingBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleEditBooking} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name*</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => handleFormChange('first_name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleFormChange('last_name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email*</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Check-in Date*</label>
                    <input
                      type="date"
                      required
                      value={formData.check_in}
                      onChange={(e) => handleFormChange('check_in', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Check-out Date*</label>
                    <input
                      type="date"
                      required
                      value={formData.check_out}
                      onChange={(e) => handleFormChange('check_out', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Room*</label>
                    <select
                      required
                      value={formData.room_id}
                      onChange={(e) => handleFormChange('room_id', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select a room</option>
                      <option value="deluxe-suite">Deluxe Suite</option>
                      <option value="economy-room">Economy Room</option>
                      <option value="family-room">Family Room</option>
                      <option value="master-suite">Master Suite</option>
                      <option value="standard-room">Standard Room</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adults*</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.adults}
                      onChange={(e) => handleFormChange('adults', parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Children</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.children}
                      onChange={(e) => handleFormChange('children', parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Price*</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.total_price}
                      onChange={(e) => handleFormChange('total_price', parseFloat(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Special Requests</label>
                  <textarea
                    value={formData.special_requests}
                    onChange={(e) => handleFormChange('special_requests', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Any special requests..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBooking(null);
                      setFormData({
                        first_name: '',
                        last_name: '',
                        email: '',
                        phone: '',
                        check_in: '',
                        check_out: '',
                        room_id: '',
                        guests: 1,
                        adults: 1,
                        children: 0,
                        total_price: 0,
                        status: 'confirmed',
                        special_requests: ''
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Update Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsSection;
