"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";
import { BiLeaf, BiPulse, BiHeart } from "react-icons/bi";

export function BlogSection() {
  const posts = [
    { 
      title: "5 Tips to Boost Immunity", 
      excerpt: "Learn how to strengthen your immune system .", 
      image: "./homeImage/boost-immunity-blog.jpg", 
      category: "Wellness", 
      icon: BiLeaf, 
      date: "Feb 1, 2026" 
    },
    { 
      title: "Managing Diabetes", 
      excerpt: "Helpful advice for daily diabetes management.", 
      image: "./homeImage/ManagingDiabetes.jpg", 
      category: "Diabetes", 
      icon: BiPulse, 
      date: "Jan 28, 2026" 
    },
    { 
      title: "Heart Health Essentials", 
      excerpt: "Keep your heart healthy with these simple habits.", 
      image: "./homeImage/HeartHealthEssentials.jpg", 
      category: "Cardiology", 
      icon: BiHeart, 
      date: "Jan 25, 2026" 
    },
  ];

  return (
    <SectionContainer className="py-16 px-6 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <h2 className="text-3xl font-extrabold mb-12 text-center text-gray-900 dark:text-white">
        Health Tips & Blog
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {posts.map((post, i) => {
          const Icon = post.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, type: "spring", stiffness: 120 }}
              whileHover={{ scale: 1.03 }}
            >
              <Card className="overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-shadow cursor-pointer relative">
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-200 to-blue-400 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-semibold z-10">
                  <Icon className="text-lg" />
                  {post.category}
                </div>

                {/* Post Image */}
                <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>

                <CardContent className="p-6 flex flex-col gap-4">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {post.title}
                  </CardTitle>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {post.excerpt}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {post.date}
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 bg-gradient-to-r from-[#0c206d] via-[#0c206d] to-[#00a4a4] text-white hover:scale-105 transition-transform"
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </SectionContainer>
  );
}
