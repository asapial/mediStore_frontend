"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
        setPreview(data.user.image || null);
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Failed to fetch profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageChange = (file: File) => {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadImageToImgBB = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=e91ee091af74018e8539c64488ba645e`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    if (!data.success) throw new Error("Failed to upload image");
    return data.data.url;
  };

  const handleUpdate = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email cannot be empty");
      return;
    }

    setUpdating(true);
    try {
      let imageUrl = user?.image || null;

      if (imageFile) {
        imageUrl = await uploadImageToImgBB(imageFile);
      }

      const res = await fetch(`/api/auth/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          image: imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setUser({ ...user!, name, email, image: imageUrl });
      setImageFile(null);
      toast.success("Profile updated successfully!");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error updating profile"
      );
    } finally {
      setUpdating(false);
    }
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-center py-10 text-muted-foreground">
        No user data found.
      </p>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <Card
        className="
        relative overflow-hidden
        bg-background/80 backdrop-blur
        border border-border
        shadow-xl rounded-2xl
      "
      >
        {/* Gradient accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 to-blue-600" />

        <CardHeader className="items-center text-center space-y-2">
          <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
          <Badge
            variant="secondary"
            className="capitalize tracking-wide"
          >
            {user.role.toLowerCase()}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <label className="group relative cursor-pointer">
              <div
                className="
                h-32 w-32 rounded-full p-[3px]
                bg-gradient-to-br from-teal-400 to-blue-500
              "
              >
                <img
                  src={preview || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover bg-background"
                />
              </div>

              {/* Hover overlay */}
              <div
                className="
                absolute inset-0 rounded-full
                bg-black/40 opacity-0
                flex items-center justify-center
                text-white
                transition group-hover:opacity-100
              "
              >
                <Camera className="h-6 w-6" />
              </div>

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  e.target.files && handleImageChange(e.target.files[0])
                }
              />
            </label>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Joined */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Joined</label>
            <Input
              readOnly
              value={new Date(user.createdAt).toLocaleDateString()}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleUpdate}
            disabled={updating}
            className="w-full text-base"
          >
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
