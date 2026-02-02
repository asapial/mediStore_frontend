import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";

export function BlogSection() {
  const posts = [
    { title: "5 Tips to Boost Immunity", excerpt: "Learn how to strengthen your immune system naturally.", image: "https://via.placeholder.com/200" },
    { title: "Managing Diabetes", excerpt: "Helpful advice for daily diabetes management.", image: "https://via.placeholder.com/200" },
    { title: "Heart Health Essentials", excerpt: "Keep your heart healthy with these simple habits.", image: "https://via.placeholder.com/200" },
  ];

  return (
    <SectionContainer className="py-16 px-6 bg-pink-100/30 dark:bg-gray-700">
      <h2 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-gray-100">Health Tips & Blog</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map((post, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-40 object-cover" />
              <CardContent>
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">{post.title}</CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{post.excerpt}</p>
                <Button size="sm" className="mt-3 bg-gradient-to-r from-[#fafdff] via-[#0c206d] to-[#00a4a4] text-white">
                  Read More
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
