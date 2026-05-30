import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { paths } from '@/config/paths';
import { getAuthToken } from '@/config/cloudflare';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Archive, Trash2 } from 'lucide-react';

const emptyForm = {
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
  status: 'pending',
  special_requests: ''
};

const BookingsSection: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    fetchBookings();
  }, []);

  const getAuthHeaders = (): Record<string, string> => {
    const token = getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(paths.buildApiUrl('bookings/list'), { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const arr = (data?.success && Array.isArray(data.data)) ? data.data : Array.isArray(data) ? data : [];
      setBookings(arr);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'adults' || field === 'children') {
        updated.guests = (field === 'adults' ? value : updated.adults) + (field === 'children' ? value : updated.children);
      }
      return updated;
    });
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(paths.buildApiUrl('bookings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (result.success) {
        toast.success('Reservation saved', {
          description: `${formData.first_name} ${formData.last_name} — ${formData.check_in}`
        });
        setShowAddForm(false);
        setFormData({ ...emptyForm });
        fetchBookings();
      } else {
        throw new Error(result.error || 'Failed to create booking');
      }
    } catch (error) {
      toast.error('Could not save reservation', { description: 'Please try again or contact support.' });
    }
  };

  const handleEditBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    try {
      const response = await fetch(paths.buildApiUrl(`bookings/${editingBooking.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ ...formData, id: editingBooking.id })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (result.success) {
        toast.success('Reservation updated');
        setEditingBooking(null);
        setFormData({ ...emptyForm });
        fetchBookings();
      } else {
        throw new Error(result.error || 'Failed to update');
      }
    } catch (error) {
      toast.error('Could not update reservation', { description: 'Please try again.' });
    }
  };

  const handleDeleteBooking = async () => {
    if (!deleteTarget) return;
    try {
      const response = await fetch(paths.buildApiUrl(`bookings/${deleteTarget.id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      toast.success('Reservation removed');
      setDeleteTarget(null);
      fetchBookings();
    } catch (error) {
      toast.error('Could not remove reservation', { description: 'Please try again.' });
      setDeleteTarget(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':    return 'border border-samudra-teal text-samudra-teal bg-transparent';
      case 'pending':      return 'border border-samudra-gold text-samudra-gold bg-transparent';
      case 'cancelled':    return 'border border-[#7a3d31] text-[#7a3d31] bg-transparent';
      case 'checked_in':  return 'border border-samudra-sand text-samudra-sand bg-transparent';
      default:             return 'border border-samudra-paper-deep text-samudra-ink-mute bg-transparent';
    }
  };

  const getGuestName = (booking: any) =>
    booking.guest_name || booking.name ||
    (booking.first_name ? `${booking.first_name} ${booking.last_name || ''}`.trim() : '') || 'N/A';

  const BookingFormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'First Name', field: 'first_name', type: 'text', required: true },
          { label: 'Last Name',  field: 'last_name',  type: 'text', required: false },
          { label: 'Email',      field: 'email',      type: 'email', required: true },
          { label: 'Phone',      field: 'phone',      type: 'tel',  required: false },
          { label: 'Check-in',   field: 'check_in',   type: 'date', required: true },
          { label: 'Check-out',  field: 'check_out',  type: 'date', required: true },
        ].map(({ label, field, type, required }) => (
          <div key={field}>
            <label className="eyebrow block mb-2">{label}{required ? ' *' : ''}</label>
            <input
              type={type}
              required={required}
              value={(formData as any)[field]}
              onChange={e => handleFormChange(field, e.target.value)}
              className="h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors"
              style={{ fontFamily: 'var(--font-label)' }}
            />
          </div>
        ))}
        <div>
          <label className="eyebrow block mb-2">Adults *</label>
          <input type="number" min="1" required value={formData.adults}
            onChange={e => handleFormChange('adults', parseInt(e.target.value))}
            className="h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors"
            style={{ fontFamily: 'var(--font-label)' }} />
        </div>
        <div>
          <label className="eyebrow block mb-2">Children</label>
          <input type="number" min="0" value={formData.children}
            onChange={e => handleFormChange('children', parseInt(e.target.value))}
            className="h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors"
            style={{ fontFamily: 'var(--font-label)' }} />
        </div>
        <div>
          <label className="eyebrow block mb-2">Total Price *</label>
          <input type="number" step="0.01" min="0" required value={formData.total_price}
            onChange={e => handleFormChange('total_price', parseFloat(e.target.value))}
            className="h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors"
            style={{ fontFamily: 'var(--font-label)' }} />
        </div>
        <div>
          <label className="eyebrow block mb-2">Status</label>
          <select value={formData.status} onChange={e => handleFormChange('status', e.target.value)}
            className="h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors"
            style={{ fontFamily: 'var(--font-label)' }}>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div>
        <label className="eyebrow block mb-2">Special Requests</label>
        <textarea value={formData.special_requests}
          onChange={e => handleFormChange('special_requests', e.target.value)}
          rows={3}
          className="w-full bg-samudra-paper border border-samudra-paper-deep px-3 py-2 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors resize-none"
          style={{ fontFamily: 'var(--font-label)' }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className="bg-samudra-paper border border-samudra-paper-deep">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-samudra-paper-soft" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-samudra-paper-soft animate-pulse" />
                <div className="h-3 w-1/2 bg-samudra-paper-soft animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-samudra-paper-soft animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-script text-samudra-gold text-[28px] leading-none mb-2">guests of samudra</p>
          <h2 className="font-display text-[40px] font-light text-samudra-ink">Reservations</h2>
          <div className="h-px w-[60px] bg-samudra-ink mt-3" style={{ opacity: 0.4 }} />
        </div>
        <Button
          onClick={() => { setShowAddForm(true); setFormData({ ...emptyForm }); }}
          className="h-11 bg-samudra-ink text-samudra-paper hover:bg-samudra-teal text-[11px] tracking-[0.3em] uppercase px-7 font-medium transition-colors"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Reservation
        </Button>
      </div>

      {/* Bookings Table */}
      <div className="bg-samudra-paper border border-samudra-paper-deep">
        {bookings.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-script text-samudra-gold text-[36px] leading-none mb-4">no reservations yet</p>
            <p className="font-display text-[18px] text-samudra-ink-soft mb-8">
              Bookings will appear here as guests reserve through Samudra.
            </p>
            <Button
              onClick={() => { setShowAddForm(true); setFormData({ ...emptyForm }); }}
              variant="outline"
              className="h-11 border-samudra-ink text-samudra-ink hover:bg-samudra-paper-soft text-[11px] tracking-[0.3em] uppercase px-7"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              + New Reservation
            </Button>
          </div>
        ) : (
          /* P1-B-4: card-stack view on mobile <640px + table for desktop (MASON 2026-05-19) */
          <>
          <div className="sm:hidden divide-y divide-samudra-paper-deep">
            {bookings.map((booking, index) => (
              <div key={booking.id || index} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-samudra-ink" style={{ fontFamily: 'var(--font-display)' }}>
                      {getGuestName(booking)}
                    </div>
                    <div className="text-[12px] text-samudra-ink-mute" style={{ fontFamily: 'var(--font-label)' }}>
                      {booking.email || booking.guest_email || ''}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-[0.2em] uppercase font-medium ${getStatusBadgeClass(booking.status)}`}
                    style={{ fontFamily: 'var(--font-label)', whiteSpace: 'nowrap' }}>
                    {booking.status || 'pending'}
                  </span>
                </div>
                <div className="text-[13px] text-samudra-ink-mute" style={{ fontFamily: 'var(--font-label)' }}>
                  <span className="font-medium text-samudra-ink">{booking.room_name || `Room ${booking.room_id}` || 'N/A'}</span>
                  {' · '}{booking.check_in || 'N/A'} → {booking.check_out || 'N/A'}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-samudra-ink">
                    Rp {Number(booking.total_price || 0).toLocaleString('id-ID')}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" className="h-10 w-10 p-0 text-samudra-ink-mute hover:text-samudra-ink" aria-label="Edit reservation"
                      onClick={() => {
                        const name = getGuestName(booking);
                        const [firstName, ...lastParts] = name.split(' ');
                        setEditingBooking(booking);
                        setFormData({
                          first_name: booking.first_name || firstName || '',
                          last_name: booking.last_name || lastParts.join(' ') || '',
                          email: booking.email || booking.guest_email || '',
                          phone: booking.phone || booking.guest_phone || '',
                          check_in: booking.check_in || '',
                          check_out: booking.check_out || '',
                          room_id: booking.room_id || '',
                          guests: booking.guests || 1,
                          adults: booking.adults || 1,
                          children: booking.children || 0,
                          total_price: parseFloat(booking.total_price || 0),
                          status: booking.status || 'pending',
                          special_requests: booking.special_requests || '',
                        });
                      }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="h-10 w-10 p-0 text-samudra-ink-mute hover:text-red-600" aria-label="Delete reservation"
                      onClick={() => setDeleteTarget(booking)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Suite</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="is-numeric">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking, index) => (
                  <TableRow key={booking.id || index}>
                    <TableCell className="is-display">
                      <div>
                        <div>{getGuestName(booking)}</div>
                        <div className="text-[12px] text-samudra-ink-mute" style={{ fontFamily: 'var(--font-label)' }}>
                          {booking.email || booking.guest_email || ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{booking.room_name || `Room ${booking.room_id}` || 'N/A'}</TableCell>
                    <TableCell>{booking.check_in || 'N/A'}</TableCell>
                    <TableCell>{booking.check_out || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-medium ${getStatusBadgeClass(booking.status)}`}
                        style={{ fontFamily: 'var(--font-label)' }}>
                        {booking.status || 'pending'}
                      </span>
                    </TableCell>
                    <TableCell className="is-numeric">
                      Rp {Number(booking.total_price || 0).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          className="h-9 w-9 p-0 text-samudra-ink-mute hover:text-samudra-ink"
                          aria-label="Edit reservation"
                          onClick={() => {
                            const name = getGuestName(booking);
                            const [firstName, ...lastParts] = name.split(' ');
                            setEditingBooking(booking);
                            setFormData({
                              first_name: booking.first_name || firstName || '',
                              last_name: booking.last_name || lastParts.join(' ') || '',
                              email: booking.email || booking.guest_email || '',
                              phone: booking.phone || booking.guest_phone || '',
                              check_in: booking.check_in || '',
                              check_out: booking.check_out || '',
                              room_id: booking.room_id || '',
                              guests: booking.guests || 1,
                              adults: booking.adults || 1,
                              children: booking.children || 0,
                              total_price: parseFloat(booking.total_price || 0),
                              status: booking.status || 'pending',
                              special_requests: booking.special_requests || ''
                            });
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-9 w-9 p-0 text-[#7a3d31] hover:text-[#5a2d21]"
                          aria-label="Delete reservation"
                          onClick={() => setDeleteTarget(booking)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>{/* end hidden sm:block */}
          </>
        )}
      </div>

      {/* Add Booking Dialog */}
      <Dialog open={showAddForm} onOpenChange={(open) => { if (!open) { setShowAddForm(false); setFormData({ ...emptyForm }); } }}>
        <DialogContent className="max-w-2xl bg-samudra-paper border border-samudra-paper-deep p-8"
          style={{ boxShadow: '0 32px 96px rgba(10,14,20,0.22), 0 4px 16px rgba(10,14,20,0.10)' }}>
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-[28px] font-light text-samudra-ink">New Reservation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBooking} className="space-y-6">
            <BookingFormFields />
            <div className="flex gap-3 justify-end mt-6">
              <Button type="button" variant="secondary"
                className="h-11 border border-samudra-ink text-samudra-ink bg-samudra-paper hover:bg-samudra-ink hover:text-samudra-paper text-[11px] tracking-[0.3em] uppercase px-7"
                style={{ fontFamily: 'var(--font-label)' }}
                onClick={() => { setShowAddForm(false); setFormData({ ...emptyForm }); }}>
                Keep
              </Button>
              <Button type="submit"
                className="h-11 bg-samudra-ink text-samudra-paper hover:bg-samudra-teal text-[11px] tracking-[0.3em] uppercase px-7"
                style={{ fontFamily: 'var(--font-label)' }}>
                Confirm Reservation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={!!editingBooking} onOpenChange={(open) => { if (!open) { setEditingBooking(null); setFormData({ ...emptyForm }); } }}>
        <DialogContent className="max-w-2xl bg-samudra-paper border border-samudra-paper-deep p-8"
          style={{ boxShadow: '0 32px 96px rgba(10,14,20,0.22), 0 4px 16px rgba(10,14,20,0.10)' }}>
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-[28px] font-light text-samudra-ink">
              Edit Reservation
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditBooking} className="space-y-6">
            <BookingFormFields />
            <div className="flex gap-3 justify-end mt-6">
              <Button type="button" variant="secondary"
                className="h-11 border border-samudra-ink text-samudra-ink bg-samudra-paper hover:bg-samudra-ink hover:text-samudra-paper text-[11px] tracking-[0.3em] uppercase px-7"
                style={{ fontFamily: 'var(--font-label)' }}
                onClick={() => { setEditingBooking(null); setFormData({ ...emptyForm }); }}>
                Keep
              </Button>
              <Button type="submit"
                className="h-11 bg-samudra-ink text-samudra-paper hover:bg-samudra-teal text-[11px] tracking-[0.3em] uppercase px-7"
                style={{ fontFamily: 'var(--font-label)' }}>
                Update Reservation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-samudra-paper border border-samudra-paper-deep"
          style={{ boxShadow: '0 32px 96px rgba(10,14,20,0.22), 0 4px 16px rgba(10,14,20,0.10)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-[22px] font-normal text-samudra-ink">
              Remove reservation?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-samudra-ink-mute" style={{ fontFamily: 'var(--font-label)' }}>
              This will permanently remove {deleteTarget ? getGuestName(deleteTarget) : 'this'}'s reservation.
              Guest notification will not be sent automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 justify-end mt-6">
            <AlertDialogCancel
              className="h-11 border border-samudra-ink text-samudra-ink bg-samudra-paper hover:bg-samudra-ink hover:text-samudra-paper text-[11px] tracking-[0.3em] uppercase px-7"
              style={{ fontFamily: 'var(--font-label)' }}>
              Keep
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBooking}
              className="h-11 bg-[#7a3d31] text-samudra-paper hover:brightness-90 text-[11px] tracking-[0.3em] uppercase px-7"
              style={{ fontFamily: 'var(--font-label)' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookingsSection;
