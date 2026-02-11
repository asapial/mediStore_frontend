"use client";

import React, { useMemo } from "react";
import {
  BiHomeAlt,
  BiShoppingBag,
  BiUserCircle,
  BiShieldQuarter,
  BiCartAlt,
  BiReceipt,
  BiUser,
  BiEditAlt,
  BiLogOut,
} from "react-icons/bi";
import { FaUserCircle } from "react-icons/fa";
import { cn } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Button } from "@/components/ui/button";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ModeToggle } from "../home/themeToggleSwitch";
import { authClient } from "@/lib/auth-client";



/* ================= TYPES ================= */

interface MenuItem {
  title: string;
  url: string;
  icon: React.ReactNode;
}

interface Navbar1Props {
  className?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  userRole?: "ADMIN" | "SELLER" | "CUSTOMER" | null;
  authenticated?: boolean;
  userImage?: string | null;
}

const handleLogout = async () => {
  try {
    await authClient.signOut();
    window.location.href = "/login"; // redirect after logout
  } catch (err) {
    console.error("Logout failed:", err);
  }
};


/* ================= MAIN COMPONENT ================= */

export const Navbar1 = ({
  logo = {
    url: "/",
    src: "../../logo/medistore-high-resolution-logo-transparent.png",
    alt: "logo",
    title: "MediStore",
  },
  userRole = null,
  authenticated = false,
  userImage = null,
  className,
}: Navbar1Props) => {
    // const handleLogout = async () => {
  //   try {
  //     await authClient.signOut();
  //     router.push("/login");
  //   } catch (err) {
  //     console.error("Logout failed:", err);
  //   }
  // };
  /**
   * ✅ Correct pattern:
   * Menu is DERIVED from props → useMemo
   * No useEffect, no setState, no warnings
   */
  const menu = useMemo<MenuItem[]>(() => {
    const baseMenu: MenuItem[] = [
      {
        title: "Home",
        url: "/",
        icon: <BiHomeAlt className="icon-neutral" />,
      },
      {
        title: "Shop",
        url: "/shop",
        icon: <BiShoppingBag className="icon-neutral" />,
      },
    ];

    if (!authenticated) return baseMenu;

    if (userRole === "ADMIN") {
      baseMenu.push({
        title: "Dashboard",
        url: "/admin",
        icon: <BiShieldQuarter className="icon-admin" />,
      });
    }

    if (userRole === "SELLER") {
      baseMenu.push({
        title: "Dashboard",
        url: "/seller/dashboard",
        icon: <BiUserCircle className="icon-seller" />,
      });
    }

    if (userRole === "CUSTOMER") {
      baseMenu.push(
        {
          title: "Cart",
          url: "/cart",
          icon: <BiCartAlt className="icon-cart" />,
        },
        {
          title: "Orders",
          url: "/orders",
          icon: <BiReceipt className="icon-orders" />,
        }
      );
    }

    return baseMenu;
  }, [authenticated, userRole]);






  return (
    <section className={cn("  bg-background", className)}>
      <div className="container py-2">
        {/* ================= DESKTOP ================= */}
        <nav className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-10">
            <a href={logo.url} className="flex items-center gap-2">
              <img src={logo.src} alt={logo.alt} className="h-8" />
            </a>

            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {menu.map(renderMenuItem)}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserAvatarMenu authenticated={authenticated} userImage={userImage} />
          </div>
        </nav>

        {/* ================= MOBILE ================= */}
        <div className="lg:hidden flex items-center justify-between">
          <a href={logo.url}>
            <img src={logo.src} alt={logo.alt} className="h-8" />
          </a>

          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <FaUserCircle />
              </Button>
            </SheetTrigger>

            <SheetContent>
              <SheetHeader>
                <SheetTitle>MediStore</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <Accordion type="single" collapsible>
                  {menu.map(renderMobileMenuItem)}
                </Accordion>

                <UserAvatarMenu
                  authenticated={authenticated}
                  userImage={userImage}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </section>
  );
};


/* ================= USER AVATAR MENU ================= */

const UserAvatarMenu = ({
  authenticated,
  userImage,
}: {
  authenticated: boolean;
  userImage?: string | null;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="rounded-full p-[2px] bg-gradient-to-br from-teal-400 to-blue-500">
        <Avatar className="h-9 w-9 bg-background">
          {authenticated && userImage && <AvatarImage src={userImage} />}
          <AvatarFallback>
            <BiUser />
          </AvatarFallback>
        </Avatar>
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" className="w-44 rounded-xl">
      {authenticated ? (
        <>
          <DropdownMenuItem asChild>
            <a href="/profile" className="flex gap-2 items-center">
              <BiEditAlt className="text-teal-500" />
              Profile
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-500 flex gap-2 items-center"
          >
            <BiLogOut />
            Sign out
          </DropdownMenuItem>
        </>
      ) : (
        <DropdownMenuItem asChild>
          <a href="/login" className="flex gap-2 items-center">
            <BiUser />
            Login
          </a>
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

/* ================= MENU HELPERS ================= */

const renderMenuItem = (item: MenuItem) => (
  <NavigationMenuItem key={item.title}>
    <NavigationMenuLink
      href={item.url}
      className="
        flex items-center gap-2 px-4 py-2 rounded-md
        text-sm font-medium text-muted-foreground
        hover:text-foreground hover:bg-muted
        transition-colors
      "
    >
      {item.icon}
      {item.title}
    </NavigationMenuLink>
  </NavigationMenuItem>
);

const renderMobileMenuItem = (item: MenuItem) => (
  <AccordionItem key={item.title} value={item.title}>
    <AccordionTrigger>{item.title}</AccordionTrigger>
    <AccordionContent>
      <a href={item.url} className="flex gap-2 py-2 items-center">
        {item.icon}
        {item.title}
      </a>
    </AccordionContent>
  </AccordionItem>
);
