"use client";

import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { BiCapsule, BiHeart } from "react-icons/bi";
import { motion } from "framer-motion";
import SectionContainer from "@/utils/SectionContainer";
import Link from "next/link";

const Footer = () => {
  return (
    <SectionContainer className="bg-gradient-to-r from-[#f0fafd] via-[#d0f5f8] to-[#b2eef6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100  ">
      <div className=" px-6 py-12 grid grid-cols-1 md:grid-cols-4 ">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
            <BiCapsule className="text-blue-600 text-3xl animate-bounce" />
            MediStore
          </h2>
          <p className="text-sm opacity-80">
            Your trusted online pharmacy for medicines, vitamins, and healthcare essentials. Fast delivery and genuine products guaranteed.
          </p>
          <div className="flex gap-4 mt-4">
            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ scale: 1.2, color: "#0c206d" }}
                className="text-xl hover:text-blue-600"
              >
                <Icon />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-blue-600 transition-colors">Shop</Link>
            </li>
            <li>
              <Link href="/featured" className="hover:text-blue-600 transition-colors">Featured</Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-blue-600 transition-colors">Categories</Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/faq" className="hover:text-blue-600 transition-colors">FAQ</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
          <p className="text-sm flex items-center gap-2">
            <FaEnvelope className="text-blue-600" /> support@medistore.com
          </p>
          <p className="text-sm flex items-center gap-2 mt-2">
            <FaPhoneAlt className="text-blue-600" /> +880 123 456 789
          </p>
          <p className="text-sm flex items-center gap-2 mt-2">
            <FaMapMarkerAlt className="text-blue-600" /> Dhaka, Bangladesh
          </p>
          <motion.div
            className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 font-semibold cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <BiHeart className="animate-pulse" /> Health & Care
          </motion.div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="text-center text-sm py-4 border-t border-gray-300 dark:border-gray-600 mt-8">
        © {new Date().getFullYear()} MediStore. All rights reserved.
      </div>
    </SectionContainer>
  );
};

export default Footer;
