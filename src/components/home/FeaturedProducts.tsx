"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BiCartAlt, BiCapsule, BiHeart, BiLeaf } from "react-icons/bi";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";

const products = [
    { name: "Paracetamol 500mg", manufacturer: "Square Pharmaceuticals", price: 12.5, icon: BiCapsule },
    { name: "Vitamin C 1000mg", manufacturer: "Renata Ltd.", price: 15, icon: BiLeaf },
    { name: "Cough Syrup", manufacturer: "Beximco Pharma", price: 18, icon: BiHeart },
    { name: "Antibiotic Capsule", manufacturer: "Eskayef", price: 25, icon: BiCapsule },
    { name: "Pain Relief Gel", manufacturer: "ACI Limited", price: 10, icon: BiHeart },
    { name: "Multivitamin", manufacturer: "Incepta", price: 22, icon: BiLeaf },
    { name: "Diabetes Care Tablets", manufacturer: "Square Pharmaceuticals", price: 30, icon: BiCapsule },
    { name: "Respiratory Aid", manufacturer: "Renata Ltd.", price: 28, icon: BiHeart },
];

export default function FeaturedProducts() {
    return (
        <SectionContainer className="bg-linear-to-r from-[#f9fcff] via-[#eef6ff] to-[#e0f0ff]
dark:bg-linear-to-tl dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 dark:to-slate-600 py-16 px-6">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-gray-100">
                Featured Medicines
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 150 }}
                    >
                        <Card
                            className="bg-gradient-to-br from-white to-[#e6f9fb] dark:from-gray-800 dark:to-gray-700 
                         hover:shadow-lg transition-shadow rounded-lg overflow-hidden"
                        >
                            <CardHeader className="flex items-center justify-center py-4">
                                <product.icon className="text-5xl text-blue-500 dark:text-blue-400" />
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    {product.name}
                                </CardTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-300">{product.manufacturer}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="font-bold text-gray-800 dark:text-gray-100">${product.price}</p>
                                    <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-[#fafdff] via-[#0c206d] to-[#00a4a4]
             text-white font-semibold px-4 py-2 rounded-lg 
             hover:scale-105 transition-transform duration-300"
                                    >
                                        <BiCartAlt className="mr-1" />
                                        Add
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </SectionContainer>
    );
}
