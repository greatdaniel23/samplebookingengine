import { useBookings } from "@/context/BookingContext";
import { useRooms } from "@/hooks/useRooms";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const AdminBookings = () => {
  const { bookings, clearAllBookings } = useBookings();
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms();
  const [query, setQuery] = useState("");

  const roomsMap = useMemo(() => {
    if (roomsLoading || roomsError) return {};
    const map: Record<string, string> = {};
    rooms.forEach((r) => (map[r.id] = r.name));
    return map;
  }, [rooms, roomsLoading, roomsError]);

  const filtered = useMemo(() => {
    if (!query.trim()) return bookings;
    const q = query.toLowerCase();
    return bookings.filter(
      (b) =>
        b.reference.toLowerCase().includes(q) ||
        roomsMap[b.roomId]?.toLowerCase().includes(q) ||
        b.user.email.toLowerCase().includes(q),
    );
  }, [bookings, query, roomsMap]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Admin – Bookings</h1>
          <Link to="/admin/management">
            <Button variant="outline" className="btn-hotel-primary">
              Management Panel
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search ref / room / email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={() => setQuery("")}>Reset</Button>
          <Button variant="destructive" onClick={clearAllBookings} disabled={!bookings.length}>Clear All</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            All Bookings ({filtered.length})
            {roomsLoading && <span className="text-sm font-normal text-muted-foreground ml-2">(Loading rooms...)</span>}
            {roomsError && <span className="text-sm font-normal text-red-500 ml-2"> (Error loading rooms)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground">No bookings yet. Go <Link to="/" className="underline">create one</Link>.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Nights</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Total ($)</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => {
                  const from = new Date(b.from);
                  const to = new Date(b.to);
                  const nights = Math.max(0, Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
                  return (
                    <TableRow key={b.id}>
                      <TableCell>{b.reference}</TableCell>
                      <TableCell>{roomsMap[b.roomId] || b.roomId}</TableCell>
                      <TableCell>{b.user.firstName} {b.user.lastName}</TableCell>
                      <TableCell>{b.user.email}</TableCell>
                      <TableCell>
                        {format(from, "MMM d, yyyy")} → {format(to, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{nights}</TableCell>
                      <TableCell>{b.guests}</TableCell>
                      <TableCell>{b.total.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(b.createdAt), "MMM d, HH:mm")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookings;
