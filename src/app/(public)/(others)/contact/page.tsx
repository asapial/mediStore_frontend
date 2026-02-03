"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { BiSupport, BiMessageDetail } from "react-icons/bi";
import SectionContainer from "@/utils/SectionContainer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <SectionContainer className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 px-6 py-16">
      <div className="space-y-16 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-100 px-4 py-1 rounded-full">
            Contact Us
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-gray-100">
            We’d love to hear from you
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-gray-300">
            Whether you have a question about your order, need help with our services, or just want to share feedback, our team is always ready to help.
          </p>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-slate-700">
              <CardHeader className="flex items-center gap-2">
                <BiSupport className="text-emerald-600 dark:text-emerald-400 text-2xl" />
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-slate-600 dark:text-gray-300">
                <p>
                  We aim to respond to all inquiries within 24 hours on business days. Your trust matters to us, and we’re committed to providing reliable and professional support.
                </p>

                <div className="flex items-center gap-4 hover:text-emerald-700 transition-colors">
                  <FaEnvelope className="text-emerald-600 dark:text-emerald-400" />
                  <span>support@medistore.com</span>
                </div>
                <div className="flex items-center gap-4 hover:text-emerald-700 transition-colors">
                  <FaPhoneAlt className="text-emerald-600 dark:text-emerald-400" />
                  <span>+880 1234 567 890</span>
                </div>
                <div className="flex items-center gap-4 hover:text-emerald-700 transition-colors">
                  <FaMapMarkerAlt className="text-emerald-600 dark:text-emerald-400" />
                  <span>Dhaka, Bangladesh</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700">
              <CardHeader className="flex items-center gap-2">
                <BiMessageDetail className="text-blue-600 dark:text-blue-400 text-2xl" />
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border border-gray-300 dark:border-gray-600 focus:ring-emerald-400 focus:border-emerald-400"
                />
                <Input
                  type="email"
                  placeholder="Your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border border-gray-300 dark:border-gray-600 focus:ring-emerald-400 focus:border-emerald-400"
                />
                <Textarea
                  rows={5}
                  placeholder="Write your message..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="border border-gray-300 dark:border-gray-600 focus:ring-emerald-400 focus:border-emerald-400"
                />
                <Button
                  className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-500 hover:scale-105 hover:shadow-lg transition-transform duration-300 text-white font-semibold"
                >
                  Submit Message
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-slate-500 dark:text-gray-400 mt-6"
        >
          By contacting us, you agree that we may store and process your information to respond to your request.
        </motion.p>
      </div>
    </SectionContainer>
  );
}
