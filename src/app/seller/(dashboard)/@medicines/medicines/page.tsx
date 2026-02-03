"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, InfoIcon } from "lucide-react";
import { GiPill, GiSyringe } from "react-icons/gi";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface Category {
  name: string;
}

interface Medicine {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: Category;
}

export default function SellerMedicinesPage() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchMedicines = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medicines/own`, {
        credentials: "include",
      });
      const data = await res.json();
      setMedicines(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seller/medicines/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete medicine");

      setMedicines(prev => prev.filter(m => m.id !== deleteId));
      setDeleteId(null);
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to delete medicine");
    }
  };

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const stockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive" className="flex items-center gap-1"><GiSyringe /> Out</Badge>;
    if (stock < 10) return <Badge variant="secondary" className="flex items-center gap-1"><GiPill /> Low</Badge>;
    return <Badge className="flex items-center gap-1"><GiPill /> In Stock</Badge>;
  };

  return (
    <div className="p-5 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-600 dark:text-blue-400">Inventory</h1>
        <Button className="flex gap-2 bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white" onClick={() => router.push("/seller/addMedicine")}>
          <Plus size={18} /> Add Medicine
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800">
        <CardContent className="p-4">
          <Input placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-gradient-to-r from-white to-emerald-50 dark:from-slate-800 dark:to-slate-900">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Medicines List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">No medicines found</TableCell>
                </TableRow>
              )}

              {filtered.map(med => (
                <motion.tr
                  key={med.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-muted-foreground/20 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <TableCell className="font-medium flex items-center gap-2">
                    <GiPill className="text-emerald-500" /> {med.name}
                  </TableCell>
                  <TableCell>{med.category.name}</TableCell>
                  <TableCell>${med.price.toFixed(2)}</TableCell>
                  <TableCell>{med.stock}</TableCell>
                  <TableCell>{stockBadge(med.stock)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="icon" variant="outline" onClick={() => router.push(`/seller/updateMedicine/${med.id}`)}>
                      <Pencil size={16} />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => { setDeleteId(med.id); setDialogOpen(true); }}>
                      <Trash2 size={16} />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => window.open(`/shop/${med.id}`, "_blank")}>
                      <InfoIcon size={16} />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Medicine</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this medicine? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
