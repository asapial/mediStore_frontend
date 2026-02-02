"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FaEdit } from "react-icons/fa";
import { Spinner } from "@/components/ui/spinner";

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

            toast.error(
                err instanceof Error
                    ? err.message
                    : "Error fetching categories"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Update category
    const updateCategory = async (id: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/categories/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: editingName }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update category");
            toast.success("Category updated");
            setEditingId(null);
            setEditingName("");
            fetchCategories();
        } catch (err: unknown) {
            console.error(err);
            toast.error(
                err instanceof Error ? err.message : "Error updating category"
            );
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-6">
            <h1 className="text-3xl font-extrabold mb-6">Manage Categories</h1>

            {loading ? (
                <p className="text-center py-10 text-muted-foreground flex justify-center items-center gap-3">Loading categories <Spinner className="size-4" /></p>
            ) : categories.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground">No categories found.</p>
            ) : (
                <Card className="overflow-x-auto">
                    <CardHeader>
                        <CardTitle>Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-mono">{category.id}</TableCell>
                                        <TableCell>
                                            {editingId === category.id ? (
                                                <Input
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                />
                                            ) : (
                                                category.name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === category.id ? (
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => updateCategory(category.id)}>Save</Button>
                                                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="outline" onClick={() => { setEditingId(category.id); setEditingName(category.name); }}>
                                                    <FaEdit className="mr-2" /> Edit
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
        </div>
    );
}
