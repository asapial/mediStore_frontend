import { Truck, ShieldCheck, RotateCcw, Headphones, CreditCard, Clock } from "lucide-react";

const features = [
  { icon: Truck, title: "Free Delivery", desc: "On orders over $50", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  { icon: ShieldCheck, title: "Genuine Products", desc: "100% authentic & certified", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day hassle-free return", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40" },
  { icon: Headphones, title: "24/7 Support", desc: "Licensed pharmacists online", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/40" },
  { icon: CreditCard, title: "Secure Payment", desc: "Encrypted transactions", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
  { icon: Clock, title: "Same Day Dispatch", desc: "Order before 2 PM", color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/40" },
];

export default function FeaturesStrip() {
  return (
    <section className="py-10 border-y border-border bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3 group">
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}