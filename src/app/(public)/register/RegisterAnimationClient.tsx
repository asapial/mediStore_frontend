"use client"
import Lottie from "lottie-react";
import LoginAnimation from "@/animation/Registration.json";

export default function RegisterAnimationClient() {
  return (
    <div><Lottie animationData={LoginAnimation} loop={true} /></div>
  )
}
