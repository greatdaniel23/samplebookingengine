import { describe, it, expect } from 'vitest';
import { verifyPassword } from './auth';
import bcrypt from 'bcryptjs';

describe('verifyPassword', () => {
  it('should return true for correct password', async () => {
    const password = 'mysecretpassword';
    const hash = await bcrypt.hash(password, 10);
    const result = await verifyPassword(password, hash);
    expect(result).toBe(true);
  });

  it('should return false for incorrect password', async () => {
    const password = 'mysecretpassword';
    const hash = await bcrypt.hash(password, 10);
    const result = await verifyPassword('wrongpassword', hash);
    expect(result).toBe(false);
  });

  it('should verify the admin default password hash', async () => {
    // Hash from d1-data.sql for admin user
    const hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    // The default password for this hash is 'password'
    const result = await verifyPassword('password', hash);
    expect(result).toBe(true);
  });
});
