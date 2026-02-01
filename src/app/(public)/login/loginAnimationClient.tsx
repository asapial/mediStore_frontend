"use client"
import Lottie from "lottie-react";
import LoginAnimation from "@/animation/Login.json";

export default function LoginAnimationClient() {
  return (
    <div><Lottie animationData={LoginAnimation} loop={true} /></div>
  )
}
