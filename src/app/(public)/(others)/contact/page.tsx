"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import SectionContainer from "@/utils/SectionContainer";

export default function ContactPage() {
  return (
    <SectionContainer className=" min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 px-6 py-16">
      <div className=" space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            We’d love to hear from you
          </h1>
          <p className="max-w-2xl mx-auto text-primary">
            Whether you have a question about your order, need help with our
            services, or just want to share feedback, our team is always ready
            to help you.
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
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Get in touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-slate-600">
                <p>
                  We aim to respond to all inquiries within 24 hours on business
                  days. Your trust matters to us, and we’re committed to
                  providing reliable and professional support.
                </p>

                <div className="flex items-center gap-4">
                  <FaEnvelope className="text-emerald-600" />
                  <span>support@medistore.com</span>
                </div>
                <div className="flex items-center gap-4">
                  <FaPhoneAlt className="text-emerald-600" />
                  <span>+880 1234 567 890</span>
                </div>
                <div className="flex items-center gap-4">
                  <FaMapMarkerAlt className="text-emerald-600" />
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
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Your name" />
                <Input type="email" placeholder="Your email" />
                <Textarea rows={5} placeholder="Write your message..." />
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
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
          className="text-center text-sm text-slate-500"
        >
          By contacting us, you agree that we may store and process your
          information to respond to your request.
        </motion.p>
      </div>
    </SectionContainer>
  );
}
