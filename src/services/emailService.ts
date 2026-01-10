/**
 * Email Service - Calls Cloudflare Worker email endpoints
 * Replaces old PHP email-service.php
 * All credentials are now secure in Cloudflare environment variables
 */

import { cloudflareApi } from './cloudflareApi';

export interface BookingEmailData {
  booking_reference: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  room_name: string;
  total_amount: string;
  special_requests?: string;
}

export class EmailService {
  /**
   * Send booking confirmation email to guest
   * Calls: POST /api/email/booking-confirmation
   */
  static async sendBookingConfirmation(bookingData: BookingEmailData) {
    try {
      const response = await fetch(
        `${cloudflareApi.baseUrl}/api/email/booking-confirmation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ booking_data: bookingData }),
        }
      );

      if (!response.ok) {
        throw new Error(`Email service error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Booking confirmation sent:', result);
      return result;
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      throw error;
    }
  }

  /**
   * Send admin notification about new booking
   * Calls: POST /api/email/admin-notification
   */
  static async sendAdminNotification(bookingData: BookingEmailData) {
    try {
      const response = await fetch(
        `${cloudflareApi.baseUrl}/api/email/admin-notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ booking_data: bookingData }),
        }
      );

      if (!response.ok) {
        throw new Error(`Email service error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Admin notification sent:', result);
      return result;
    } catch (error) {
      console.error('Error sending admin notification:', error);
      throw error;
    }
  }

  /**
   * Send both guest confirmation and admin notification
   * Convenience method that calls both endpoints
   */
  static async sendBookingEmails(bookingData: BookingEmailData) {
    try {
      const confirmationResult = await this.sendBookingConfirmation(bookingData);
      const adminResult = await this.sendAdminNotification(bookingData);

      return {
        success: true,
        confirmation: confirmationResult,
        admin: adminResult,
        message: 'Both emails sent successfully',
      };
    } catch (error) {
      console.error('Error sending booking emails:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to send emails',
      };
    }
  }

  /**
   * Send admin notification about booking status change
   * Calls: POST /api/email/status-change
   */
  static async sendStatusChangeNotification(
    bookingData: BookingEmailData,
    oldStatus: string,
    newStatus: string
  ) {
    try {
      const response = await fetch(
        `${cloudflareApi.baseUrl}/api/email/status-change`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            booking_data: bookingData,
            old_status: oldStatus,
            new_status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Email service error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Status change notification sent:', result);
      return result;
    } catch (error) {
      console.error('Error sending status change notification:', error);
      throw error;
    }
  }

  /**
   * Test email service
   * Sends test email to verify credentials work
   */
  static async testEmail(testEmail: string = 'test@example.com') {
    try {
      const testData: BookingEmailData = {
        booking_reference: `TEST-${Date.now()}`,
        guest_name: 'Test User',
        guest_email: testEmail,
        guest_phone: '+1-555-0000',
        check_in: new Date().toISOString().split('T')[0],
        check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        guests: 1,
        room_name: 'Test Room',
        total_amount: '0.00',
        special_requests: 'This is a test email',
      };

      return await this.sendBookingConfirmation(testData);
    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  }
}

export default EmailService;
