"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { CircleUserRound } from 'lucide-react';

const userId = 'user-123'; // hardcoded user ID

// Define a type for the user object
interface User {
  id: string;
  username: string;
  passwordHash: string; // Store password as a hash in a real app
}

// Create a fake user for demonstration purposes
const fakeUser: User = {
  id: 'fake-user-id',
  username: 'user',
  passwordHash: 'password', // In real apps, hash the password!
};

/**
 * Represents a time slot.
 */
export interface TimeSlot {
  /**
   * The id of the time slot.
   */
  id: string;
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

import { getAvailableTimeSlots } from '@/services/tennis-court';

export default function Home() {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }

    if (isAuthenticated) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const slots = await getAvailableTimeSlots();
          setAvailableTimeSlots(slots);

          // Retrieve bookings from localStorage
          let storedBookingsString = localStorage.getItem('bookings');
          let storedBookings: Booking[] = [];

          if (storedBookingsString) {
              try {
                  storedBookings = JSON.parse(storedBookingsString);
              } catch (e) {
                  console.error("Failed to parse bookings from local storage", e);
                  // Handle the error appropriately, e.g., by clearing the local storage
                  localStorage.removeItem('bookings');
              }
          }
          setUserBookings(storedBookings);

           // Retrieve booked time slots from local storage
           const storedBookedTimeSlotsString = localStorage.getItem('bookedTimeSlots');
           let storedBookedTimeSlots: string[] = [];

           if (storedBookedTimeSlotsString) {
              try {
                  storedBookedTimeSlots = JSON.parse(storedBookedTimeSlotsString);
              } catch (e) {
                  console.error("Failed to parse bookedTimeSlots from local storage", e);
                  // Handle the error appropriately, e.g., by clearing the local storage
                  localStorage.removeItem('bookedTimeSlots');
              }
          }

           setBookedTimeSlots(storedBookedTimeSlots);
        } catch (error: any) {
          console.error("Failed to fetch data:", error);
          toast({
            title: "Error",
            description: "Failed to load data. Please try again later.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setAvailableTimeSlots([]);
      setUserBookings([]);
      setBookedTimeSlots([]);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/');
    setUserBookings([]);
    setAvailableTimeSlots([]);
    localStorage.removeItem('bookings'); // Clear bookings from localStorage
    localStorage.removeItem('bookedTimeSlots'); // Clear booked time slots from localStorage
    setBookedTimeSlots([]);
    toast({
      title: "Logout Successful",
      description: "You have been successfully logged out.",
    });
  };

  const handleBookTimeSlot = async (timeSlot: TimeSlot) => {
    try {
      // Update bookedTimeSlots state
      setBookedTimeSlots(prev => {
        const newBookedTimeSlots = [...prev, timeSlot.id];
        localStorage.setItem('bookedTimeSlots', JSON.stringify(newBookedTimeSlots));
        return newBookedTimeSlots;
      });

      setUserBookings(prev => {
        const newBookings = [...prev, { id: timeSlot.id, timeSlot: timeSlot }];
        // Sort the bookings by timeSlot.startTime
        newBookings.sort((a, b) => a.timeSlot.startTime.localeCompare(b.timeSlot.startTime));
        
        // Save bookings to localStorage
        localStorage.setItem('bookings', JSON.stringify(newBookings));
        return newBookings;
      });
      
      // Update availableTimeSlots state
      setAvailableTimeSlots(prev => {
        return prev.map(slot =>
          slot.id === timeSlot.id ? { ...slot, isAvailable: false } : slot
        );
      });

      toast({
        title: "Booking Confirmed",
        description: `You have successfully booked the court from ${timeSlot.startTime} to ${timeSlot.endTime}.`,
      });
    } catch (error: any) {
      console.error("Failed to book time slot:", error);
      toast({
        title: "Error",
        description: "Failed to book time slot. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setUserBookings(prev => {
        const newBookings = prev.filter(booking => booking.timeSlot.id !== bookingId);
        localStorage.setItem('bookings', JSON.stringify(newBookings));
        return newBookings;
      });

       // Update bookedTimeSlots state
       setBookedTimeSlots(prev => {
        const newBookedTimeSlots = prev.filter(id => id !== bookingId);
        localStorage.setItem('bookedTimeSlots', JSON.stringify(newBookedTimeSlots));
        return newBookedTimeSlots;
      });

      setAvailableTimeSlots(prev => {
        return prev.map(slot => {
          if (slot.id === bookingId) {
            return { ...slot, isAvailable: true };
          }
          return slot;
        });
      });

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    } catch (error: any) {
      console.error("Failed to cancel booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <div className="flex justify-between mb-4">
        <Link href="/profile">
          <Button variant="ghost">
            <CircleUserRound className="mr-2 h-4 w-4" />
            Profile
          </Button>
        </Link>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Available Time Slots</CardTitle>
            <CardDescription>Book your preferred time slot.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {availableTimeSlots.length > 0 ? (
              availableTimeSlots.map((timeSlot, index) => {
                const isBooked = bookedTimeSlots.includes(timeSlot.id);
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span><i className="fa-regular fa-clock"></i> {timeSlot.startTime} - {timeSlot.endTime}</span>
                    <Button
                      onClick={() => handleBookTimeSlot(timeSlot)}
                      disabled={isBooked || !timeSlot.isAvailable}
                    >
                      {isBooked ? "Booked" : "Book"}
                    </Button>
                  </div>
                );
              })
            ) : (
              <div>No available time slots at the moment.</div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Your Bookings</CardTitle>
            <CardDescription>Manage your upcoming and past bookings.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {userBookings.length > 0 ? (
              userBookings.map((booking) => (
                <div key={booking.timeSlot.id} className="flex items-center justify-between">
                  <span><i className="fa-regular fa-clock"></i> {booking.timeSlot.startTime} - {booking.timeSlot.endTime}</span>
                  <Button variant="destructive" onClick={() => handleCancelBooking(booking.timeSlot.id)}>
                    Cancel
                  </Button>
                </div>
              ))
            ) : (
              <div>No bookings found.</div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
