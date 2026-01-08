import { Booking } from '@/types';

export interface OfflineBooking extends Booking {
  pendingSync: boolean;
}

const STORAGE_KEY = 'offlineBookings';

function loadOfflineBookings(): OfflineBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OfflineBooking[];
  } catch {
    return [];
  }
}

function persist(list: OfflineBooking[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

export function saveOfflineBooking(booking: OfflineBooking) {
  const list = loadOfflineBookings();
  list.push(booking);
  persist(list);
}

export function removeOfflineBooking(id: number) {
  const list = loadOfflineBookings().filter(b => b.id !== id);
  persist(list);
}

export async function trySyncOfflineBookings(apiEndpoint: string): Promise<{ synced: OfflineBooking[]; failed: OfflineBooking[] }> {
  const list = loadOfflineBookings();
  if (list.length === 0) return { synced: [], failed: [] };

  const synced: OfflineBooking[] = []; const failed: OfflineBooking[] = [];
  for (const b of list) {
    try {
      const payload = {
        roomId: b.roomId,
        from: b.from.split('T')[0],
        to: b.to.split('T')[0],
        guests: b.guests,
        user: {
          firstName: b.user.firstName,
          lastName: b.user.lastName,
          email: b.user.email,
          phone: b.user.phone || ''
        },
        total: b.total
      };
      const res = await fetch(apiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        synced.push(b);
        removeOfflineBooking(b.id);
      } else {
        failed.push(b);
      }
    } catch {
      failed.push(b);
    }
  }
  return { synced, failed };
}

export function getOfflineCount(): number {
  return loadOfflineBookings().length;
}
