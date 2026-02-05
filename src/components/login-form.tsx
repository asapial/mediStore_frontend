"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaSpinner,
  FaShieldAlt,
} from "react-icons/fa"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      setLoading(true)

      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
      // const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Login failed")

      switch (data.user.role) {
        case "CUSTOMER":
          window.location.href = "/"
          break
        case "SELLER":
          window.location.href = "/seller/dashboard"
          break
        case "ADMIN":
          window.location.href = "/admin"
          break
        default:
          window.location.href = "/"
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("w-full max-w-md mx-auto", className)}
    >
      <Card className="rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
        <CardHeader className="space-y-2 text-center pb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <FaShieldAlt className="text-emerald-600 dark:text-emerald-400 text-xl" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Login to continue to <span className="font-medium text-emerald-600">MediStore</span>
          </p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            {...props}
          >
            <FieldGroup>
              {/* Email */}
              <Field>
                <FieldLabel>Email</FieldLabel>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="pl-10"
                  />
                </div>
              </Field>

              {/* Password */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel>Password</FieldLabel>
                  <a
                    href="#"
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="password"
                    type="password"
                    required
                    className="pl-10"
                  />
                </div>
              </Field>

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="group w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Login
                    <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </FieldGroup>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground">
              Secure login · Cookies enabled · HIPAA-friendly
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
