"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "../ui/spinner";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
}

export default function SidebarUserCard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
          { credentials: "include" }
        );
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {

      await authClient.signOut();
      router.push("/login"); // redirect after logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (!user)
    return (
      <div className="p-4 flex items-center justify-center">
        <p className="text-sm text-muted-foreground"><Spinner></Spinner></p>
      </div>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="p-4 flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          {/* Avatar */}
          <Avatar className="w-12 h-12">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name} />
            ) : (
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            )}
          </Avatar>

          {/* User info */}
          <div className="flex flex-col">
            <p className="font-semibold text-sm text-foreground dark:text-white">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {user.role}
            </Badge>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-40 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg rounded-md p-1">
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
