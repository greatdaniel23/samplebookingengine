/**
 * useEmailService - React hook for sending booking emails
 * Uses Cloudflare Worker email endpoints (secure, no hardcoded credentials)
 */

import { useState } from 'react';
import { EmailService, BookingEmailData } from '@/services/emailService';

export interface SendEmailOptions {
  includeAdmin?: boolean;
  includeGuest?: boolean;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export function useEmailService() {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const sendBookingConfirmation = async (
    bookingData: BookingEmailData,
    options: SendEmailOptions = {}
  ) => {
    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      const {
        includeAdmin = true,
        includeGuest = true,
        onSuccess,
        onError,
      } = options;

      let result;

      if (includeAdmin && includeGuest) {
        // Send both
        result = await EmailService.sendBookingEmails(bookingData);
      } else if (includeGuest) {
        // Send guest only
        result = await EmailService.sendBookingConfirmation(bookingData);
      } else if (includeAdmin) {
        // Send admin only
        result = await EmailService.sendAdminNotification(bookingData);
      } else {
        throw new Error('Must send to at least guest or admin');
      }

      setSuccess(true);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  const sendStatusChangeNotification = async (
    bookingData: BookingEmailData,
    oldStatus: string,
    newStatus: string,
    onSuccess?: (result: any) => void,
    onError?: (error: Error) => void
  ) => {
    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await EmailService.sendStatusChangeNotification(
        bookingData,
        oldStatus,
        newStatus
      );
      setSuccess(true);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  const testEmail = async (
    testEmail: string = 'test@example.com',
    onSuccess?: (result: any) => void,
    onError?: (error: Error) => void
  ) => {
    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await EmailService.testEmail(testEmail);
      setSuccess(true);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendBookingConfirmation,
    sendStatusChangeNotification,
    testEmail,
    isSending,
    error,
    success,
  };
}

export default useEmailService;
