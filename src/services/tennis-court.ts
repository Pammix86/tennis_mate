'use server';

import {initializeApp} from 'firebase/app';
import {getDatabase, ref, get, set, push, remove, child} from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e: any) {
  console.error('Firebase initialization error:', e.message);
  console.warn(
    'Ensure your .env file has the correct Firebase configuration, and DATABASE_URL is in the format: https://<YOUR FIREBASE>.firebaseio.com'
  );
}

const db = app ? getDatabase(app) : null;

/**
 * Represents a time slot.
 */
export interface TimeSlot {
  /**
   * The start time of the time slot.
   */
  startTime: string;
  /**
   * The end time of the time slot.
   */
  endTime: string;
  /**
   * Whether the time slot is available.
   */
  isAvailable: boolean;
}

/**
 * Represents a booking.
 */
export interface Booking {
  /**
   * The id of the booking.
   */
  id: string;
  /**
   * The time slot of the booking.
   */
  timeSlot: TimeSlot;
}

/**
 * Asynchronously retrieves available time slots.
 * @returns A promise that resolves to an array of TimeSlot objects.
 */
export async function getAvailableTimeSlots(): Promise<TimeSlot[]> {
  if (!db) {
    console.warn('Database not initialized.');
    return [];
  }

  const availableTimeSlotsRef = ref(db, 'availableTimeSlots');
  try {
    const snapshot = await get(availableTimeSlotsRef);
    if (snapshot.exists()) {
      const slots: TimeSlot[] = Object.values(snapshot.val());
      return slots;
    } else {
      console.log('No available time slots found in the database.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    return [];
  }
}

/**
 * Asynchronously books a time slot.
 * @param timeSlot The time slot to book.
 * @returns A promise that resolves to a Booking object.
 */
export async function bookTimeSlot(timeSlot: TimeSlot): Promise<Booking> {
  if (!db) {
    console.warn('Database not initialized.');
    return {} as Booking;
  }

  const bookingId = push(child(ref(db), 'bookings')).key;
  if (!bookingId) {
    throw new Error('Failed to generate booking ID.');
  }

  const booking: Booking = {
    id: bookingId,
    timeSlot: timeSlot,
  };

  try {
    await set(ref(db, 'bookings/' + bookingId), booking);
    return booking;
  } catch (error) {
    console.error('Error booking time slot:', error);
    throw error;
  }
}

/**
 * Asynchronously retrieves bookings for a user.
 * @param userId The id of the user.
 * @returns A promise that resolves to an array of Booking objects.
 */
export async function getBookingsForUser(userId: string): Promise<Booking[]> {
  if (!db) {
    console.warn('Database not initialized.');
    return [];
  }

  const bookingsRef = ref(db, 'bookings');
  try {
    const snapshot = await get(bookingsRef);
    if (snapshot.exists()) {
      const bookings: Booking[] = Object.values(snapshot.val()).filter(
        (booking: any) => booking.userId === userId
      );
      return bookings;
    } else {
      console.log('No bookings found in the database.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

/**
 * Asynchronously cancels a booking.
 * @param bookingId The id of the booking to cancel.
 * @returns A promise that resolves when the booking is cancelled.
 */
export async function cancelBooking(bookingId: string): Promise<void> {
  if (!db) {
    console.warn('Database not initialized.');
    return;
  }

  try {
    await remove(ref(db, 'bookings/' + bookingId));
  } catch (error) {
    console.error('Error cancelling booking:', error);
  }
}
