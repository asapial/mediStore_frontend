"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FaUserEdit, FaUserSlash, FaUserCheck } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";
import SectionContainer from "@/utils/SectionContainer";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
  isBanned: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(data.data);
      setFilteredUsers(data.data);
    } catch (e) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* ================= BAN / UNBAN ================= */
  const toggleBan = async (id: string, ban: boolean) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/${id}/ban`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ban }),
        }
      );
      toast.success(`User ${ban ? "banned" : "unbanned"}`);
      fetchUsers();
    } catch {
      toast.error("Action failed");
    }
  };

  /* ================= UPDATE USER ================= */
  const saveUser = async () => {
    if (!editingUser) return;
    setSaving(true);

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/${editingUser.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editingUser.name,
            role: editingUser.role,
          }),
        }
      );
      toast.success("User updated");
      setEditingUser(null);
      fetchUsers();
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= FILTER USERS ================= */
  useEffect(() => {
    if (!search) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter(
          (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, users]);

  /* ================= ROLE BADGE ================= */
  const roleBadge = (role: User["role"]) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="destructive">Admin</Badge>;
      case "SELLER":
        return <Badge variant="outline">Seller</Badge>;
      case "CUSTOMER":
      default:
        return <Badge variant="secondary">Customer</Badge>;
    }
  };

  return (
    <SectionContainer className=" bg-gradient-to-r from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

      {/* ================= SEARCH ================= */}
      <Input
        placeholder="Search by name or email..."
        className="mb-4 max-w-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow
                    key={u.id}
                    className={u.isBanned ? "bg-red-50" : ""}
                  >
                    <TableCell className="flex items-center gap-3">
                      <img
                        src={
                          u.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            u.name
                          )}&background=0D8ABC&color=fff`
                        }
                        className="w-10 h-10 rounded-full"
                        alt={u.name}
                      />
                      {u.name}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{roleBadge(u.role)}</TableCell>
                    <TableCell>
                      {u.isBanned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge>Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={saving}
                        onClick={() => setEditingUser(u)}
                        title="Edit User"
                      >
                        <FaUserEdit />
                      </Button>
                      <Button
                        size="icon"
                        variant={u.isBanned ? "secondary" : "destructive"}
                        disabled={saving}
                        title={u.isBanned ? "Unban User" : "Ban User"}
                        onClick={() => toggleBan(u.id, !u.isBanned)}
                      >
                        {u.isBanned ? <FaUserCheck /> : <FaUserSlash />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ================= EDIT MODAL ================= */}
      <Dialog
        open={!!editingUser}
        onOpenChange={() => setEditingUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          {editingUser && (
            <div className="space-y-4">
              <Input
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
                placeholder="User name"
              />

              <Select
                value={editingUser.role}
                onValueChange={(val) =>
                  setEditingUser({ ...editingUser, role: val as User["role"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="SELLER">Seller</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={saveUser}
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SectionContainer>
  );
}
