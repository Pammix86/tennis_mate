"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { toast } from "@/hooks/use-toast";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
  });

  const router = useRouter();

  const handleBackToHome = () => {
    router.push(`/`);
  };

  useEffect(() => {
    // Replace with actual data fetching logic in a real application
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    } else {
      const dummyProfile: UserProfile = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
      };
      setProfile(dummyProfile);
    }
     }, []);

  const handleUpdateProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Manage your personal information here.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="First Name"
              value={profile.firstName}
              onChange={(e) =>
                setProfile({ ...profile, firstName: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Last Name"
              value={profile.lastName}
              onChange={(e) =>
                setProfile({ ...profile, lastName: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email Address"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBackToHome}>Back to Home</Button>
            <Button onClick={handleUpdateProfile}>Update Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
