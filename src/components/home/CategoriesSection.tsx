"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
    BiCategory,
    BiHeart,
    BiDroplet,
    BiPulse,
    BiWind,
    BiLeaf,
    BiBadge,
    BiBandAid
} from "react-icons/bi";
import SectionContainer from "@/utils/SectionContainer";

export default function CategoriesSection() {
    const categories = [
        { name: "Antibiotic", icon: BiBadge, bg: "from-[#ffe5e5] to-[#ffd6d6]" },
        { name: "Pain Relief", icon: BiDroplet, bg: "from-[#e0f7fa] to-[#b2ebf2]" },
        { name: "Vitamins & Supplements", icon: BiLeaf, bg: "from-[#e6ffe6] to-[#ccffcc]" },
        { name: "Cough & Cold", icon: BiWind, bg: "from-[#fff5e6] to-[#ffe0b2]" },
        { name: "Antihistamine", icon: BiBandAid, bg: "from-[#f3e6ff] to-[#e0ccff]" },
        { name: "Diabetes Care", icon: BiPulse, bg: "from-[#e6f0ff] to-[#cce0ff]" },
        { name: "Gastric & Ulcer", icon: BiHeart, bg: "from-[#fff0f5] to-[#ffd6e0]" },
        { name: "Cardiac Care", icon: BiPulse, bg: "from-[#ffe6f0] to-[#ffccd9]" },
        // { name: "Respiratory", icon: BiWind, bg: "from-[#e6fff9] to-[#ccfff0]" },
    ];

    return (
        <SectionContainer className=" bg-linear-to-r from-[#f9fcff] via-[#eef6ff] to-[#e0f0ff]
dark:bg-linear-to-r dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 dark:to-gray-600 py-16">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-gray-100">
                Top Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map(({ name, icon: Icon, bg }) => (
                    <motion.div
                        key={name}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 200 }}
                    >
                        <Card
                            className={`hover:shadow-lg transition-shadow cursor-pointer text-center py-6 
                          bg-gradient-to-br ${bg} dark:bg-gray-800`}
                        >
                            <CardHeader className="flex flex-col items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className="text-lg px-4 py-2 dark:text-gray-100"
                                >
                                    {name}
                                </Badge>
                                <Icon className="text-4xl text-blue-600 dark:text-blue-400" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-700 dark:text-gray-700">
                                    Explore top medicines in {name} category
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </SectionContainer>
    );
}
