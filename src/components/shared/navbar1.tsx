"use client";

import React, { useState, useEffect } from "react";
import { BiHomeAlt, BiShoppingBag, BiUserCircle, BiShieldQuarter } from "react-icons/bi";
import { cn } from "@/lib/utils";
import {  BiCartAlt, BiReceipt } from "react-icons/bi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "../home/themeToggleSwitch";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  className?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
    className?: string;
  };
  auth?: {
    login: {
      title: string;
      url: string;
    };
    signup: {
      title: string;
      url: string;
    };
  };
  userRole?: "ADMIN" | "SELLER" |"CUSTOMER"| null;
  authenticated?:boolean;
}

export const Navbar1 = ({
  logo = {
    url: "/",
    src: "../../logo/medistore-high-resolution-logo-transparent.png",
    alt: "logo",
    title: "MediStore",
  },
  auth = {
    login: { title: "Login", url: "/login" },
    signup: { title: "Sign up", url: "/register" },
  },
  userRole = null,
  authenticated=false,
  className,
}: Navbar1Props) => {
  // base menu
  const [menu, setMenu] = useState<MenuItem[]>([
    { title: "Home", url: "/", icon: <BiHomeAlt className="text-blue-600" /> },
    { title: "Shop", url: "/shop", icon: <BiShoppingBag className="text-green-600" /> },
  ]);

  // Add conditional Dashboard item based on role
useEffect(() => {
  let roleItems: MenuItem[] = [];

  console.log("Authentication value form the navbar : ", authenticated)

  if (userRole === "ADMIN" && authenticated) {
    roleItems.push({
      title: "Dashboard",
      url: "/admin",
      icon: <BiShieldQuarter className="text-red-600" />,
      description: "Admin Panel",
    });
  } 
  else if (userRole === "SELLER" && authenticated) {
    roleItems.push({
      title: "Dashboard",
      url: "/seller/dashboard",
      icon: <BiUserCircle className="text-purple-600" />,
      description: "Seller Panel",
    });
  } 
  else if (userRole === "CUSTOMER" && authenticated) {
    roleItems.push(
      {
        title: "Cart",
        url: "/cart",
        icon: <BiCartAlt className="text-emerald-600" />,
        description: "View items in your cart",
      },
      {
        title: "Orders",
        url: "/orders",
        icon: <BiReceipt className="text-blue-600" />,
        description: "Track your orders",
      }
    );
  }

  if (roleItems.length > 0) {
    setMenu((prev) => [
      ...prev.filter(
        (item) =>
          item.title !== "Dashboard" &&
          item.title !== "Cart" &&
          item.title !== "Orders"
      ),
      ...roleItems,
    ]);
  }
}, [userRole,authenticated]);


  return (
    <section className={cn("py-4", className)}>
      <div className="container">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <img src={logo.src} className="max-h-8 " alt={logo.alt} />
            </a>

            <NavigationMenu>
              <NavigationMenuList>
                {menu.map((item) => renderMenuItem(item))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex gap-2">
            <ModeToggle />
            <Button asChild variant="outline" size="sm">
              <a href={auth.login.url}>{auth.login.title}</a>
            </Button>
            <Button asChild size="sm">
              <a href={auth.signup.url}>{auth.signup.title}</a>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <img src={logo.src} className="max-h-8 " alt={logo.alt} />
            </a>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <BiHomeAlt className="text-lg" />
                </Button>
              </SheetTrigger>

              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2">
                      <img src={logo.src} className="max-h-8 " alt={logo.alt} />
                    </a>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6 p-4">
                  <Accordion type="single" collapsible className="flex w-full flex-col gap-4">
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>

                  <div className="flex flex-col gap-3">
                    <Button asChild variant="outline">
                      <a href={auth.login.url}>{auth.login.title}</a>
                    </Button>
                    <Button asChild>
                      <a href={auth.signup.url}>{auth.signup.title}</a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

// Desktop menu item
const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="group inline-flex h-10 w-max items-center gap-2 rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground"
      >
        {item.icon && <span className="text-lg">{item.icon}</span>}
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

// Mobile menu item
const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a key={item.title} href={item.url} className="text-md font-semibold flex items-center gap-2">
      {item.icon && <span>{item.icon}</span>}
      {item.title}
    </a>
  );
};

// Submenu link
const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-sm leading-snug text-muted-foreground">{item.description}</p>
        )}
      </div>
    </a>
  );
};
