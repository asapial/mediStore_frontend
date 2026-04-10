import { LoginForm } from "@/components/login-form"
import LoginAnimationClient from "./loginAnimationClient"
import SectionContainer from "@/utils/SectionContainer"
import { FaClinicMedical } from "react-icons/fa"

export default function LoginPage() {
  return (
    <SectionContainer className="flex items-center justify-center py-16">
      <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 shadow-2xl backdrop-blur">
        
        {/* Soft gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-cyan-50/60 dark:from-emerald-950/40 dark:to-slate-900 pointer-events-none" />

        <div className="relative grid min-h-[600px] lg:grid-cols-2">
          
          {/* ================= LEFT: LOGIN FORM ================= */}
          <div className="flex flex-col justify-between p-8 md:p-12">


            {/* Login Form */}
            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-md">
                <LoginForm />
              </div>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} MediStore · Secure Healthcare Platform
            </p>
          </div>

          {/* ================= RIGHT: ANIMATION / VISUAL ================= */}
          <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-emerald-100 via-cyan-100 to-sky-100 dark:from-emerald-950 dark:via-slate-900 dark:to-slate-800">
            
            {/* Soft overlay */}
            <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />

            {/* Animation */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <LoginAnimationClient />
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
