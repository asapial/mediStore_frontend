"use client";
import Link from "next/link";
import { ModeToggle } from "../home/themeToggleSwitch";

export default function SidebarHeaderWithLog() {


    const toggleMode = () => {

    };

    return (
        <div className="px-4 py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md  shadow-md flex items-center justify-between">
            {/* Logo + App Name */}
            <Link href="/" className="flex items-center gap-3">
                {/* <div className="w-10 h-10 bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center rounded-full font-bold text-lg shadow-lg">
          
        </div> */}

                <div className="flex flex-col">
                    <span className="font-extrabold text-lg text-foreground dark:text-white">
                        <img
                            src="/logo/medistore-high-resolution-logo-transparent.png"
                            className="max-h-8 "
                            alt="MediStore logo"
                        />
                    </span>
                    {/* <span className="text-xs text-center">Admin Panel</span> */}
                </div>
            </Link>

            {/* Dark/Light Mode Toggle */}
            <div className="flex items-center gap-2">
                        <ModeToggle></ModeToggle>
            </div>
        </div>
    );
}
