import { LoginForm } from "@/components/login-form";
import LoginAnimationClient from "./loginAnimationClient";
import Logo from "@/components/shared/NamePlate";

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0F2740 0%, #1B3A5C 40%, #243F63 100%)" }}>
      {/* Decorative background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #C2703A, transparent)", top: "-10%", left: "-5%" }} />
        <div className="absolute w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #3A6EA5, transparent)", bottom: "0%", right: "0%" }} />
        <div className="absolute w-64 h-64 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #2E7D32, transparent)", top: "50%", left: "50%" }} />
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      <div className="relative min-h-screen flex">
        {/* ── LEFT: Branding Panel ─────────────────────────────────── */}
        <div className="hidden lg:flex flex-col w-[46%] p-12 justify-between">


          {/* Center content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-black text-white leading-tight mb-4">
                Your Health,<br />
                <span style={{ color: "#C2703A" }}>Our Priority</span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed">
                Access thousands of trusted medicines, health products, and expert advice — all in one place.
              </p>
            </div>

            {/* Feature points */}
            <div className="space-y-4">
              {[
                { emoji: "💊", title: "10,000+ Products",   desc: "Verified medicines & supplements" },
                { emoji: "🚚", title: "Fast Delivery",      desc: "Same-day delivery available" },
                { emoji: "🔒", title: "100% Secure",        desc: "Encrypted & safe transactions" },
                { emoji: "⭐", title: "Expert Support",     desc: "Pharmacists available 24/7" },
              ].map(({ emoji, title, desc }) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                    {emoji}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{title}</p>
                    <p className="text-white/50 text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-white/80 text-sm italic leading-relaxed mb-3">
                "LifeLine has made managing my family's medications so much easier. Fast delivery and authentic products!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "#C2703A", color: "#FFF" }}>A</div>
                <div>
                  <p className="text-white text-xs font-bold">Ayesha K.</p>
                  <p className="text-white/40 text-xs">Verified Customer</p>
                </div>
                <div className="ml-auto text-amber-400 text-sm">★★★★★</div>
              </div>
            </div>
          </div>

          <p className="text-white/30 text-xs">© {new Date().getFullYear()} LifeLine · Secure Healthcare Platform</p>
        </div>

        {/* ── RIGHT: Login Form ─────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12" style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)" }}>
          <div className="w-full max-w-md">

            {/* Glass card wrapping the form */}
            <div className="rounded-3xl p-1" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))" }}>
              <div className="rounded-[22px] p-5 sm:p-8" style={{ background: "rgba(255,255,255,0.95)" }}>
                <LoginForm />
              </div>
            </div>

            <p className="text-center text-white/30 text-xs mt-6">
              By signing in, you agree to our{" "}
              <a href="#" className="text-white/50 hover:text-white transition-colors underline">Terms</a>{" "}
              and{" "}
              <a href="#" className="text-white/50 hover:text-white transition-colors underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
