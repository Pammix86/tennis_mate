"use client";

import { useEffect, useState } from 'react';
import { getAvailableTimeSlots, bookTimeSlot, getBookingsForUser, cancelBooking, TimeSlot, Booking } from '@/services/tennis-court';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Toaster } from "@/components/ui/toaster"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Circle } from "lucide-react";

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
      // Find the time slot in availableTimeSlots and disable it
      setAvailableTimeSlots(prev =>
        prev.map(slot =>
          slot.id === timeSlot.id ? { ...slot, isAvailable: false } : slot
        )
      );
  
      // Add the time slot to user bookings
      const bookingId = Math.random().toString(36).substring(7); // Generate a random ID
      const newBooking: Booking = {
        id: bookingId,
        timeSlot: timeSlot,
      };
      setUserBookings(prev => [...prev, newBooking]);
  
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
      // Find the booking to be cancelled
      const bookingToRemove = userBookings.find(booking => booking.id === bookingId);
  
      if (bookingToRemove) {
        // Enable the time slot in availableTimeSlots
        setAvailableTimeSlots(prev =>
          prev.map(slot =>
            slot.id === bookingToRemove.timeSlot.id ? { ...slot, isAvailable: true } : slot
          )
        );
  
        // Remove the booking from user bookings
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
            <Circle className="h-6 w-6 text-green-500" />
              Tennis Court Booking
            </CardTitle>
            </div>
            <CardDescription>Enter your username and password to access the booking system.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            
            
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            
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
                  booking.timeSlot.startTime === timeSlot.startTime && booking.timeSlot.endTime === timeSlot.endTime
                );
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span>{timeSlot.startTime} - {timeSlot.endTime}</span>
                    <Button
                      onClick={() => handleBookTimeSlot(timeSlot)}
                      disabled={!timeSlot.isAvailable || isBooked}
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
              userBookings.map((booking, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{booking.timeSlot.startTime} - {booking.timeSlot.endTime}</span>
                  <Button variant="destructive" onClick={() => handleCancelBooking(booking.id)}>
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


