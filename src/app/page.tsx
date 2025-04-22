"use client";

import { useEffect, useState } from 'react';
import { getAvailableTimeSlots, bookTimeSlot, getBookingsForUser, cancelBooking, TimeSlot, Booking } from '@/services/tennis-court';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Toaster } from "@/components/ui/toaster"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function Home() {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const slots = await getAvailableTimeSlots();
          setAvailableTimeSlots(slots);

          const bookings = await getBookingsForUser(userId);
          setUserBookings(bookings);
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
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    // Basic authentication logic (replace with a real authentication system)
    if (username === fakeUser.username && password === fakeUser.passwordHash) {
      setIsAuthenticated(true);
      toast({
        title: "Login Successful",
        description: "You have successfully logged in.",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    }
  };

  const handleBookTimeSlot = async (timeSlot: TimeSlot) => {
    try {
      setUserBookings(prev => {
        const newBookings = [...prev, { id: timeSlot.id, timeSlot: timeSlot }];
        // Sort the bookings by timeSlot.startTime
        newBookings.sort((a, b) => a.timeSlot.startTime.localeCompare(b.timeSlot.startTime));
        return newBookings;
      });

      setAvailableTimeSlots(prev => {
        return prev.map(slot => {
          if (slot.id === timeSlot.id) {
            return { ...slot, isAvailable: false };
          }
          return slot;
        });
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
      // Find the booking to remove
      const bookingToRemove = userBookings.find(booking => booking.id === bookingId);

      if (bookingToRemove) {
        // Update the available time slots by setting the specific time slot to available
        setAvailableTimeSlots(prev => {
          const newSlots = prev.map(slot => {
            if (slot.id === bookingToRemove.timeSlot.id) {
              return { ...slot, isAvailable: true };
            }
            return slot;
          });
          return newSlots;
        });

        // Remove the booking from the user bookings
        setUserBookings(prev => prev.filter(booking => booking.id !== bookingId));

        toast({
          title: "Booking Cancelled",
          description: "Your booking has been successfully cancelled.",
        });
      } else {
        toast({
          title: "Error",
          description: "Booking not found.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to cancel booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <Toaster />
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CardTitle>
                <i className="fa-solid fa-table-tennis-paddle-ball"></i>
                Tennis Court Booking
              </CardTitle>
            </div>
            <CardDescription>Enter your username and password to access the booking system.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleLogin}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Available Time Slots</CardTitle>
            <CardDescription>Book your preferred time slot.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {availableTimeSlots.length > 0 ? (
              availableTimeSlots.map((timeSlot, index) => {
                const isBooked = userBookings.some(booking =>
                  booking.timeSlot.id === timeSlot.id
                );
                return (
                  <div key={timeSlot.id} className="flex items-center justify-between">
                    <span><i className="fa-regular fa-clock"></i> {timeSlot.startTime} - {timeSlot.endTime}</span>
                    <Button
                      onClick={() => handleBookTimeSlot(timeSlot)}
                      disabled={!timeSlot.isAvailable || isBooked}
                    >
                      {timeSlot.isAvailable ? (isBooked ? "Booked" : "Book") : "Booked"}
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
              userBookings.map((booking, index) => (
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

