"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleUserRound } from 'lucide-react';
import { getAvailableTimeSlots } from '@/services/tennis-court';

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

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    // Basic authentication logic (replace with a real authentication system)
    if (username === fakeUser.username && password === fakeUser.passwordHash) {
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/tennis');
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

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-table-tennis-paddle-ball"></i>
            <CardTitle>
              Tennis Mate
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
