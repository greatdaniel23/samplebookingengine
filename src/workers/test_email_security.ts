import worker from './index';

// Mock Data
const MOCK_BOOKING = {
  booking_reference: 'VALID-123',
  email: 'realuser@example.com',
  first_name: 'Real',
  last_name: 'User',
  room_name: 'Deluxe Room',
  total_price: 1000000,
  room_id: 1
};

// Mock Env
const mockEnv = {
  DB: {
    prepare: (query: string) => {
      return {
        bind: (...args: any[]) => ({
          first: async () => {
             // If querying for valid ref, return mock booking
             if (args[0] === 'VALID-123') return MOCK_BOOKING;
             return null;
          },
          all: async () => ({ results: [] }),
          run: async () => ({ meta: { last_row_id: 1 } }),
        }),
        first: async () => null,
      };
    },
  },
  CACHE: {
    put: async () => {},
    get: async () => null,
  },
  RESEND_API_KEY: 'mock-api-key',
  VILLA_NAME: 'Test Villa',
  JWT_SECRET: 'test-secret',
  ADMIN_EMAIL: 'admin@test.com'
};

// Mock global fetch
// @ts-ignore
globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
  // @ts-ignore
  globalThis.lastFetchUrl = url.toString();
  if (init && init.body) {
    // @ts-ignore
    globalThis.lastFetchBody = JSON.parse(init.body as string);
  }
  return new Response(JSON.stringify({ id: 'mock-email-id' }), { status: 200 });
}

async function runTest() {
  console.log('--- Starting Open Relay Fix Verification ---');

  // TEST 1: Attack Attempt (Invalid Reference)
  console.log('\nTest 1: Attack Attempt (Invalid Reference)');
  // Reset mock state
  // @ts-ignore
  globalThis.lastFetchUrl = '';
  // @ts-ignore
  globalThis.lastFetchBody = null;

  const attackBody = {
    booking_data: {
      booking_reference: 'FAKE-123',
      guest_email: 'attacker@example.com' // Should be ignored/rejected
    }
  };

  const attackRequest = new Request('http://localhost/api/email/booking-confirmation', {
    method: 'POST',
    body: JSON.stringify(attackBody),
    headers: { 'Content-Type': 'application/json' }
  });

  try {
    // @ts-ignore
    const response = await worker.fetch(attackRequest, mockEnv as any);

    // @ts-ignore
    const lastUrl = globalThis.lastFetchUrl;

    if (response.status === 404 && lastUrl === '') {
      console.log('✅ SUCCESS: Attack blocked (404 Not Found and no email sent).');
    } else {
      console.log('❌ FAILURE: Attack succeeded or unexpected response.');
      console.log('Status:', response.status);
      console.log('Email Sent:', lastUrl !== '');
    }

  } catch (error) {
    console.error('Error in Test 1:', error);
  }

  // TEST 2: Valid Request
  console.log('\nTest 2: Valid Request (Valid Reference)');
  // Reset mock state
  // @ts-ignore
  globalThis.lastFetchUrl = '';
  // @ts-ignore
  globalThis.lastFetchBody = null;

  const validBody = {
    booking_data: {
      booking_reference: 'VALID-123',
      guest_email: 'ignored@example.com' // Should be ignored in favor of DB
    }
  };

  const validRequest = new Request('http://localhost/api/email/booking-confirmation', {
    method: 'POST',
    body: JSON.stringify(validBody),
    headers: { 'Content-Type': 'application/json' }
  });

  try {
    // @ts-ignore
    const response = await worker.fetch(validRequest, mockEnv as any);

    // @ts-ignore
    const lastUrl = globalThis.lastFetchUrl;
    // @ts-ignore
    const lastBody = globalThis.lastFetchBody;

    if (response.status === 200 && lastUrl === 'https://api.resend.com/emails') {
        if (lastBody?.to?.includes('realuser@example.com')) {
            console.log('✅ SUCCESS: Valid email sent to correct user (from DB).');
        } else {
            console.log('❌ FAILURE: Email sent to WRONG recipient.');
            console.log('Recipient:', lastBody?.to);
        }
    } else {
      console.log('❌ FAILURE: Valid request failed.');
      console.log('Status:', response.status);
      if (lastUrl) console.log('Last URL:', lastUrl);
    }

  } catch (error) {
    console.error('Error in Test 2:', error);
  }

    // TEST 3: Admin Notification
  console.log('\nTest 3: Admin Notification (Valid Reference)');
  // Reset mock state
  // @ts-ignore
  globalThis.lastFetchUrl = '';
  // @ts-ignore
  globalThis.lastFetchBody = null;

  const adminBody = {
    booking_data: {
      booking_reference: 'VALID-123',
    }
  };

  const adminRequest = new Request('http://localhost/api/email/admin-notification', {
    method: 'POST',
    body: JSON.stringify(adminBody),
    headers: { 'Content-Type': 'application/json' }
  });

  try {
    // @ts-ignore
    const response = await worker.fetch(adminRequest, mockEnv as any);

    // @ts-ignore
    const lastUrl = globalThis.lastFetchUrl;

    if (response.status === 200 && lastUrl === 'https://api.resend.com/emails') {
      console.log('✅ SUCCESS: Admin email sent.');
    } else {
      console.log('❌ FAILURE: Admin email failed.');
      console.log('Status:', response.status);
    }

  } catch (error) {
    console.error('Error in Test 3:', error);
  }
}

runTest();
