"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
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
        console.error("Profile fetch error:", err);

        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to fetch profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Preview selected image
  const handleImageChange = (file: File) => {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Upload image to imgbb
  const uploadImageToImgBB = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    const res = await fetch(`https://api.imgbb.com/1/upload?key=e91ee091af74018e8539c64488ba645e`, {
      method: "POST",
      body: formData,
    });
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

      // Upload image if selected
      if (imageFile) {
        imageUrl = await uploadImageToImgBB(imageFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), image: imageUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setUser({ ...user!, name: name.trim(), email: email.trim(), image: imageUrl });
      setImageFile(null);
      toast.success("Profile updated successfully!");
    } catch (err: unknown) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Error updating profile"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="text-center py-10">Loading profile...</p>;
  if (!user) return <p className="text-center py-10">No user data found.</p>;

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Profile Image */}
          <div className="flex flex-col items-center space-y-2">
            <img
              src={preview || "https://via.placeholder.com/120"}
              alt="Profile"
              className="w-28 h-28 object-cover rounded-full border"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleImageChange(e.target.files[0])}
              className="mt-2"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* Role */}
          <div>
            <label className="block mb-1 font-medium">Role</label>
            <Input value={user.role} readOnly />
          </div>

          {/* Joined Date */}
          <div>
            <label className="block mb-1 font-medium">Joined</label>
            <Input value={new Date(user.createdAt).toLocaleDateString()} readOnly />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button onClick={handleUpdate} disabled={updating}>
            {updating ? "Updating..." : "Update Profile"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
