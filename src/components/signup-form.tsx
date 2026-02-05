"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTag,
  FaClinicMedical,
  FaEye,
  FaEyeSlash,
  FaImage,
} from "react-icons/fa"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [imageUploading, setImageUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  /* ---------------- IMAGE UPLOAD (IMGBB) ---------------- */
  const handleImageUpload = async (file: File) => {
    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch(
        "https://api.imgbb.com/1/upload?key=e91ee091af74018e8539c64488ba645e",
        {
          method: "POST",
          body: formData,
        }
      )

      const data = await res.json()
      setImageUrl(data.data.url)
    } catch {
      setError("Image upload failed")
    } finally {
      setImageUploading(false)
    }
  }

  /* ---------------- SUBMIT ---------------- */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const role = formData.get("role") as "CUSTOMER" | "SELLER"

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setLoading(true)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
            image: imageUrl,
          }),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Registration failed")
      }

      window.location.href = "/login"
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      // initial={{ opacity: 0, y: 20 }}
      // animate={{ opacity: 1, y: 0 }}
      // transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col gap-6 rounded-2xl border bg-white/80 dark:bg-slate-950/70 p-8 shadow-xl backdrop-blur",
        className
      )}
      {...props}
    >


      {/* ---------- HEADER ---------- */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900">
          <FaClinicMedical className="text-emerald-600 dark:text-emerald-400 text-xl" />
        </div>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Join MediStore as a customer or seller
        </p>
      </div>
      {/* ---------- TOP AVATAR PREVIEW (h-30 w-30) ---------- */}
      {imageUrl && (
        <div className="flex justify-center">
          <div className="h-30 w-30 rounded-full border border-emerald-500 overflow-hidden shadow">
            <img
              src={imageUrl}
              alt="Profile preview"
              className="h-full w-full object-fill"
            />
          </div>
        </div>
      )}

      <FieldGroup>
        {/* ---------- IMAGE UPLOAD ---------- */}
        <Field>
          <FieldLabel>Profile Image</FieldLabel>
          <label className="flex w-fit items-center gap-2 cursor-pointer rounded-md border px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition">
            <FaImage />
            Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                e.target.files && handleImageUpload(e.target.files[0])
              }
            />
          </label>
          {imageUploading && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Uploading image…
            </span>
          )}
        </Field>

        {/* ---------- NAME ---------- */}
        <Field>
          <FieldLabel>Full Name</FieldLabel>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input name="name" required className="pl-9" />
          </div>
        </Field>

        {/* ---------- EMAIL ---------- */}
        <Field>
          <FieldLabel>Email</FieldLabel>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input name="email" type="email" required className="pl-9" />
          </div>
        </Field>

        {/* ---------- PASSWORD ---------- */}
        <Field>
          <FieldLabel>Password</FieldLabel>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </Field>

        {/* ---------- CONFIRM PASSWORD ---------- */}
        <Field>
          <FieldLabel>Confirm Password</FieldLabel>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              className="pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </Field>

        {/* ---------- ROLE ---------- */}
        <Field>
          <FieldLabel>Register As</FieldLabel>
          <div className="relative">
            <FaUserTag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              name="role"
              required
              className="h-10 w-full rounded-md border bg-background px-9 text-sm"
            >
              <option value="">Select role</option>
              <option value="CUSTOMER">Customer</option>
              <option value="SELLER">Seller</option>
            </select>
          </div>
        </Field>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {/* ---------- SUBMIT ---------- */}
        <Button
          type="submit"
          disabled={loading || imageUploading}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-600 hover:underline">
            Sign in
          </a>
        </p>
      </FieldGroup>
    </form>
  )
}
