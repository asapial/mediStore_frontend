"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include", // must include cookie
        });


        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await res.json();
        setUser(data.user); // assuming backend returns { user: {...} }
      } catch (err) {
        console.error("Profile fetch error:", err);
        // setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  if (!user) return <div className="p-6">No user data found.</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded-lg mt-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">Full Name</label>
        <input
          type="text"
          value={user.name}
          readOnly
          className="w-full border rounded px-3 py-2 bg-gray-50"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Email</label>
        <input
          type="email"
          value={user.email}
          readOnly
          className="w-full border rounded px-3 py-2 bg-gray-50"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Role</label>
        <input
          type="text"
          value={user.role}
          readOnly
          className="w-full border rounded px-3 py-2 bg-gray-50"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Joined</label>
        <input
          type="text"
          value={new Date(user.createdAt).toLocaleDateString()}
          readOnly
          className="w-full border rounded px-3 py-2 bg-gray-50"
        />
      </div>
    </div>
  );
}
