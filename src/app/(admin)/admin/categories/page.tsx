"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { Spinner } from "@/components/ui/spinner";
import SectionContainer from "@/utils/SectionContainer";
import MedicineLoadingPage from "@/components/shared/LoadingPage";

interface Category {
  id: string;
  name: string;
}

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/categories`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch categories");
      setCategories(data.data);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error fetching categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Update category
  const updateCategory = async (id: string) => {
    if (!editingName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editingName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update category");
      toast.success("Category updated successfully");
      setEditingId(null);
      setEditingName("");
      fetchCategories();
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error updating category");
    }
  };

  return (
    <SectionContainer className="bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800 py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-emerald-800 dark:text-emerald-400">
        Manage Categories
      </h1>

      {loading ? (
<MedicineLoadingPage text="categories"></MedicineLoadingPage>
      ) : categories.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground text-lg">No categories found.</p>
      ) : (
        <Card className="overflow-x-auto rounded-xl shadow-md hover:shadow-xl transition-shadow border border-emerald-200 dark:border-slate-700">
          <CardHeader className=" dark:bg-slate-800 rounded-t-xl">
            <CardTitle className="text-2xl text-emerald-700 text-center">Categories</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <Table className="min-w-full">
              <TableHeader className=" bg-emerald-50">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {categories.map((category) => (
                  <TableRow
                    key={category.id}
                    className={`transition-colors hover:bg-emerald-50 dark:hover:bg-slate-800 ${
                      editingId === category.id ? "bg-emerald-200 dark:bg-slate-700" : ""
                    }`}
                  >
                    <TableCell className="font-mono">{category.id}</TableCell>

                    <TableCell>
                      {editingId === category.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="bg-white dark:bg-slate-900 border-emerald-300 dark:border-slate-600"
                        />
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">{category.name}</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {editingId === category.id ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="flex items-center gap-2"
                            onClick={() => updateCategory(category.id)}
                          >
                            <FaSave /> Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => { setEditingId(null); setEditingName(""); }}
                          >
                            <FaTimes /> Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-slate-700"
                          onClick={() => { setEditingId(category.id); setEditingName(category.name); }}
                        >
                          <FaEdit /> Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </SectionContainer>
  );
}
