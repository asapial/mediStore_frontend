"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Category = {
    id: string;
    name: string;
};

export default function AddMedicinePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        image: "",
        price: "",
        stock: "",
        manufacturer: "",
        categoryId: "",
    });

    /* ------------------ FETCH CATEGORIES ------------------ */
    useEffect(() => {
        const fetchCategories = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/categories`); // frontend API
            const data = await res.json();
            setCategories(data.data);
        };

        fetchCategories();
    }, []);

    /* ------------------ IMAGE UPLOAD (IMGBB) ------------------ */
    const handleImageUpload = async (file: File) => {
        setImageUploading(true);

        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(
            `https://api.imgbb.com/1/upload?key=e91ee091af74018e8539c64488ba645e`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await res.json();
        setForm(prev => ({ ...prev, image: data.data.url }));
        setImageUploading(false);
    };

    /* ------------------ SUBMIT ------------------ */
    const handleSubmit = async () => {
        try {
            setLoading(true);

            const payload = {
                ...form,
                price: Number(form.price),
                stock: Number(form.stock),
            };

            console.log("Medicine Payload:", payload);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seller/medicines`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                    credentials:"include"
                }
            );

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to add medicine");
            }

            const data = await res.json();
            console.log("Medicine created:", data);

            // optional: reset form
            // setForm(initialState);

        } catch (error:unknown) {
            console.error("Add medicine error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <Card className="border-muted/40 shadow-sm">
                {/* Header */}
                <CardHeader className="border-b justify-center">
                    <CardTitle className="text-2xl font-semibold text-center">
                        Add New Medicine
                    </CardTitle>
                    <p className="text-sm text-muted-foreground text-center">
                        Provide medicine details, pricing, and category information
                    </p>
                </CardHeader>

                <CardContent className="space-y-8 pt-8">
                    {/* ---------- BASIC INFO ---------- */}
                    <div className="space-y-4">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label>Medicine Name</Label>
                                <Input
                                    placeholder="Paracetamol 500mg"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            {/* Manufacturer */}
                            <div className="space-y-2">
                                <Label>Manufacturer</Label>
                                <Input
                                    placeholder="Square Pharmaceuticals"
                                    value={form.manufacturer}
                                    onChange={e =>
                                        setForm({ ...form, manufacturer: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                rows={4}
                                placeholder="Used to relieve mild to moderate pain and fever..."
                                value={form.description}
                                onChange={e =>
                                    setForm({ ...form, description: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* ---------- INVENTORY ---------- */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Inventory & Pricing
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <Label>Price (৳)</Label>
                                <Input
                                    type="number"
                                    placeholder="12.50"
                                    value={form.price}
                                    onChange={e => setForm({ ...form, price: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Stock Quantity</Label>
                                <Input
                                    type="number"
                                    placeholder="500"
                                    value={form.stock}
                                    onChange={e => setForm({ ...form, stock: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    onValueChange={value =>
                                        setForm({ ...form, categoryId: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* ---------- IMAGE UPLOAD ---------- */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Medicine Image
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Upload */}
                            <div className="space-y-2">
                                <Label>Upload Image</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={e =>
                                        e.target.files && handleImageUpload(e.target.files[0])
                                    }
                                />
                                {imageUploading && (
                                    <p className="text-xs text-muted-foreground">
                                        Uploading image...
                                    </p>
                                )}
                            </div>

                            {/* Preview */}
                            {form.image && (
                                <div className="flex justify-center md:justify-end">
                                    <div className="border rounded-lg p-3 bg-muted/40">
                                        <img
                                            src={form.image}
                                            alt="Medicine preview"
                                            className="h-40 w-40 object-contain rounded-md"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ---------- ACTION ---------- */}
                    <div className="pt-6 border-t">
                        <Button
                            size="lg"
                            className="w-full md:w-auto px-10"
                            onClick={handleSubmit}
                            disabled={loading || imageUploading}
                        >
                            {loading ? "Saving Medicine..." : "Add Medicine"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

    );
}
