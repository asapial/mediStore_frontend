import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  /** Wrap the logo in an anchor tag linking to href. Defaults to "/" */
  href?: string;
  /** Disable the link wrapper entirely */
  asLink?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional className for the wrapper */
  className?: string;
}

const sizeMap = {
  sm: { logo: 28, text: "text-base",  gap: "gap-1.5" },
  md: { logo: 36, text: "text-xl",    gap: "gap-2"   },
  lg: { logo: 48, text: "text-2xl",   gap: "gap-3"   },
};

export default function Logo({
  href = "/",
  asLink = true,
  size = "md",
  className = "",
}: LogoProps) {
  const { logo, text, gap } = sizeMap[size];

  const inner = (
    <span className={`flex items-center ${gap} flex-shrink-0 ${className}`}>
      {/* Logo image */}
      <Image
        src="/logo/lifeline_logo.png"
        alt=" logo"
        width={logo}
        height={logo}
        className="object-contain"
        priority
      />

      {/* Wordmark */}
      <span
        className={`font-black tracking-tight leading-none ${text}`}
        style={{ color: "#1B3A5C" }}   /* Deep Navy */
      >
        LifeLine
      </span>
    </span>
  );

  if (!asLink) return inner;

  return (
    <Link href={href} className="inline-flex items-center">
      {inner}
    </Link>
  );
}