'use server';

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

// In-memory data (replace with a real database for production)
let availableTimeSlots: TimeSlot[] = [
  { startTime: '09:00', endTime: '10:00', isAvailable: true },
  { startTime: '10:00', endTime: '11:00', isAvailable: true },
  { startTime: '11:00', endTime: '12:00', isAvailable: false },
];

let bookings: Booking[] = [];

/**
 * Asynchronously retrieves available time slots.
 * @returns A promise that resolves to an array of TimeSlot objects.
 */
export async function getAvailableTimeSlots(): Promise<TimeSlot[]> {
  // Simulate an asynchronous operation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(availableTimeSlots);
    }, 500);
  });
}

/**
 * Asynchronously books a time slot.
 * @param timeSlot The time slot to book.
 * @returns A promise that resolves to a Booking object.
 */
export async function bookTimeSlot(timeSlot: TimeSlot): Promise<Booking> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!timeSlot.isAvailable) {
        reject(new Error('Time slot is not available'));
        return;
      }

      const bookingId = Math.random().toString(36).substring(7); // Generate a random ID
      const booking: Booking = {
        id: bookingId,
        timeSlot: timeSlot,
      };

      bookings = [...bookings, booking];
      availableTimeSlots = availableTimeSlots.map(slot =>
        slot.startTime === timeSlot.startTime && slot.endTime === timeSlot.endTime
          ? { ...slot, isAvailable: false }
          : slot
      );

      resolve(booking);
    }, 500);
  });
}

/**
 * Asynchronously retrieves bookings for a user.
 * @param userId The id of the user.
 * @returns A promise that resolves to an array of Booking objects.
 */
export async function getBookingsForUser(userId: string): Promise<Booking[]> {
  //In this implementation, we will only have a single user for the time being.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(bookings);
    }, 500);
  });
}

/**
 * Asynchronously cancels a booking.
 * @param bookingId The id of the booking to cancel.
 * @returns A promise that resolves when the booking is cancelled.
 */
export async function cancelBooking(bookingId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const bookingToRemove = bookings.find(booking => booking.id === bookingId);
      if (bookingToRemove) {
        bookings = bookings.filter(booking => booking.id !== bookingId);
        // Make the time slot available again
        availableTimeSlots = availableTimeSlots.map(slot => {
          if (slot.startTime === bookingToRemove.timeSlot.startTime && slot.endTime === bookingToRemove.timeSlot.endTime) {
            return { ...slot, isAvailable: true };
          }
          return slot;
        });
      }
      resolve();
    }, 500);
  });
}
