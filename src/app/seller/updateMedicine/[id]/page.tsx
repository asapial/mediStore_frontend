"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  manufacturer: string;
  image?: string;
  categoryId: string;
}

export default function UpdateMedicinePage() {
  const router = useRouter();
  const params = useParams();
  const medicineId = params.id;

  const [form, setForm] = useState<Medicine | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/categories`
        );
        const data = await res.json();
        setCategories(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch medicine data
  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medicines/${medicineId}`
        );
        if (!res.ok) throw new Error("Failed to fetch medicine");
        const fetchedData = await res.json();
        const data= fetchedData.data;

        console.log(data)

        // Always provide default values to avoid controlled/uncontrolled warning
        setForm({
          id: data.id ?? medicineId,
          name: data.name ?? "",
          description: data.description ?? "",
          price: data.price ?? 0,
          stock: data.stock ?? 0,
          manufacturer: data.manufacturer ?? "",
          image: data.image ?? "",
          categoryId: data.categoryId ?? "",
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchMedicine();
  }, [medicineId]);

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("https://api.imgbb.com/1/upload?key=e91ee091af74018e8539c64488ba645e", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setForm((prev) => prev && { ...prev, image: data.url });
    } catch (err) {
      console.error(err);
    } finally {
      setImageUploading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!form) return;

    try {
      setLoading(true);

      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seller/medicines/${medicineId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update medicine");

      router.push("/seller/medicines");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Render loading if medicine data is not ready
  if (!form) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Update Medicine</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-1">
            <Label className="font-semibold">Medicine Name</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => prev && { ...prev, name: e.target.value })
              }
              className="border rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="font-semibold">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) =>
                  prev ? { ...prev, description: e.target.value } : prev
                )
              }
              className="border rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Image */}
          <div className="space-y-1">
            <Label className="font-semibold">Medicine Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files && handleImageUpload(e.target.files[0])
              }
            />
            {imageUploading && (
              <p className="text-sm text-muted-foreground">
                Uploading image...
              </p>
            )}
            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="h-32 w-32 object-cover rounded-md border mt-2"
              />
            )}
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="font-semibold">Price</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm((prev) =>
                    prev
                      ? { ...prev, price: Number(e.target.value) }
                      : prev
                  )
                }
                className="border rounded-md focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="space-y-1">
              <Label className="font-semibold">Stock</Label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm((prev) =>
                    prev ? { ...prev, stock: Number(e.target.value) } : prev
                  )
                }
                className="border rounded-md focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Manufacturer */}
          <div className="space-y-1">
            <Label className="font-semibold">Manufacturer</Label>
            <Input
              value={form.manufacturer}
              onChange={(e) =>
                setForm((prev) =>
                  prev ? { ...prev, manufacturer: e.target.value } : prev
                )
              }
              className="border rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label className="font-semibold">Category</Label>
            <Select
              value={form.categoryId ?? ""}
              onValueChange={(value) =>
                setForm((prev) => (prev ? { ...prev, categoryId: value } : prev))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button
            className="w-full py-3 text-lg font-medium mt-4"
            onClick={handleSubmit}
            disabled={loading || imageUploading}
          >
            {loading ? "Updating..." : "Update Medicine"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
