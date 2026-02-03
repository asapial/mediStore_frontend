"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BiCartAlt, BiCapsule, BiHeart, BiLeaf, BiStar } from "react-icons/bi";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";

const products = [
  { name: "Paracetamol 500mg", manufacturer: "Square Pharmaceuticals", price: 12.5, icon: BiCapsule, inStock: true },
  { name: "Vitamin C 1000mg", manufacturer: "Renata Ltd.", price: 15, icon: BiLeaf, inStock: true },
  { name: "Cough Syrup", manufacturer: "Beximco Pharma", price: 18, icon: BiHeart, inStock: false },
  { name: "Antibiotic Capsule", manufacturer: "Eskayef", price: 25, icon: BiCapsule, inStock: true },
  { name: "Pain Relief Gel", manufacturer: "ACI Limited", price: 10, icon: BiHeart, inStock: true },
  { name: "Multivitamin", manufacturer: "Incepta", price: 22, icon: BiLeaf, inStock: true },
  { name: "Diabetes Care Tablets", manufacturer: "Square Pharmaceuticals", price: 30, icon: BiCapsule, inStock: false },
  { name: "Respiratory Aid", manufacturer: "Renata Ltd.", price: 28, icon: BiHeart, inStock: true },
];

export default function FeaturedProducts() {
  return (
    <SectionContainer className="relative py-16 px-6 bg-gradient-to-br from-[#f0faff] via-[#e6f9fb] to-[#d0f0f9] dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 overflow-hidden">
      
      {/* Decorative floating stars */}
      <motion.div
        className="absolute top-10 left-10 text-blue-100 dark:text-blue-800 text-4xl opacity-20"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      >
        <BiStar />
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10 text-blue-100 dark:text-blue-800 text-5xl opacity-20"
        animate={{ rotate: [0, -360] }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
      >
        <BiStar />
      </motion.div>

      <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-gray-800 dark:text-gray-100">
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
            <Card className="relative bg-gradient-to-br from-white to-[#e0f7fa] dark:from-gray-800 dark:to-gray-700 hover:shadow-xl transition-shadow rounded-xl overflow-hidden">
              
              {/* In Stock / Out of Stock Badge */}
              <div className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full ${
                product.inStock ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300" 
                                : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300"
              }`}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </div>

              <CardHeader className="flex items-center justify-center py-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600">
                <product.icon className="text-5xl text-blue-500 dark:text-blue-400" />
              </CardHeader>

              <CardContent className="flex flex-col gap-2">
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {product.name}
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-300">{product.manufacturer}</p>
                
                <div className="flex justify-between items-center mt-3">
                  <p className="font-bold text-gray-800 dark:text-gray-100">${product.price}</p>
                  <Button
                    size="sm"
                    disabled={!product.inStock}
                    className={`flex items-center gap-1 bg-gradient-to-r from-[#fafdff] via-[#0c206d] to-[#00a4a4] text-white font-semibold px-4 py-2 rounded-lg hover:scale-105 transition-transform duration-300 shadow-md ${
                      !product.inStock && "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <BiCartAlt className="text-lg" /> Add
                  </Button>
                </div>

                {/* Optional small rating */}
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, starIdx) => (
                    <BiStar key={starIdx} className={`text-yellow-400 ${starIdx >= 4 ? "opacity-50" : ""}`} />
                  ))}
                  <span className="text-xs text-gray-500 dark:text-gray-300 ml-2">(4.5)</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
