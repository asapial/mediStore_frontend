"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { Spinner } from "@/components/ui/spinner";
import SectionContainer from "@/utils/SectionContainer";
import MedicineLoadingPage from "@/components/shared/LoadingPage";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Category {
  id: string;
  name: string;
}

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Create
  const [newCategory, setNewCategory] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ================= FETCH ================= */
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCategories(data.data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= CREATE ================= */
  const createCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newCategory }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Category added");
      setNewCategory("");
      fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  /* ================= UPDATE ================= */
  const updateCategory = async (id: string) => {
    if (!editingName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editingName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Category updated");
      setEditingId(null);
      setEditingName("");
      fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  /* ================= DELETE ================= */
  const deleteCategory = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/categories/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Category deleted");
      setDeleteId(null);
      fetchCategories();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SectionContainer className="py-10">
      <h1 className="text-4xl font-bold mb-8 text-emerald-800">
        Manage Categories
      </h1>

      {/* ADD */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Input
            placeholder="Category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <Button onClick={createCategory} disabled={creating}>
            {creating ? <Spinner /> : <FaPlus />}
            Add
          </Button>
        </CardContent>
      </Card>

      {/* LIST */}
      {loading ? (
        <MedicineLoadingPage text="categories" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-mono">{cat.id}</TableCell>

                    <TableCell>
                      {editingId === cat.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                        />
                      ) : (
                        cat.name
                      )}
                    </TableCell>

                    <TableCell className="flex justify-center gap-2">
                      {editingId === cat.id ? (
                        <>
                          <Button size="sm" onClick={() => updateCategory(cat.id)}>
                            <FaSave />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            <FaTimes />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(cat.id);
                              setEditingName(cat.name);
                            }}
                          >
                            <FaEdit />
                          </Button>

                          {/* DELETE DIALOG */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteId(cat.id)}
                              >
                                <FaTrash />
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete category?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the category.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => setDeleteId(null)}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={deleteCategory}
                                  disabled={deleting}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {deleting ? <Spinner /> : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
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
