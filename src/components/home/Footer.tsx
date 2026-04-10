import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const footerLinks = {
  "Quick Links": ["Home", "Shop", "Health Topics", "About Us", "Blog", "FAQ", "Contact"],
  "Customer Service": ["My Account", "Order Tracking", "Returns & Exchanges", "Shipping Policy", "Privacy Policy", "Terms of Service"],
  "Categories": ["Medicines", "Vitamins", "Supplements", "Personal Care", "Baby Care", "Sports Nutrition", "Herbal Remedies"],
};

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-black text-lg">P</span>
              </div>
              <span className="font-black text-xl text-foreground">Pro<span className="text-emerald-500">Pharm</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-xs">
              Your trusted online pharmacy. We deliver genuine medicines, vitamins, and health products right to your door — fast, safe, and affordable.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="tel:+18001234567" className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <Phone className="w-4 h-4 text-emerald-500" /> +1 800 123 4567
              </a>
              <a href="mailto:help@Pharmora.com" className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <Mail className="w-4 h-4 text-emerald-500" /> help@Pharmora.com
              </a>
              <span className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> 123 Health Street, Suite 100, New York, NY 10001
              </span>
            </div>
            {/* Social */}
            <div className="flex items-center gap-2 mt-5">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-muted hover:bg-emerald-500 hover:text-white text-muted-foreground flex items-center justify-center transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-foreground text-sm mb-4">{title}</h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors hover:underline underline-offset-2">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 Pharmora. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>🔒 SSL Secured</span>
            <span>💳 Visa · Mastercard · PayPal · Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}