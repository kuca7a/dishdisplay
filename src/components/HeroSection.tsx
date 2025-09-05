import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-[#ffffff] text-black py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-6xl font-semibold mb-6">
              Bring Your Menu to Life with Beautiful Photos
            </h1>
            <p className="text-xl mb-8 font-medium">
              Help customers make confident dining decisions with high-quality
              photos of every dish on your menu.
            </p>
            <Link
              href="/login"
              className="block bg-[#5F7161] hover:bg-[#4C5B4F] text-white px-8 py-4 rounded-lg font-medium hover:cursor-pointer transition-colors text-lg w-full text-center"
            >
              Get Started - Choose Your Path
            </Link>
          </div>
          <div className="md:w-1/2 flex flex-col md:flex-row items-center justify-center gap-6">
            <Image
              src="/mockupPhone.png"
              alt="Dish Display on phone"
              width={600}
              height={900}
              className="w-[250px] md:w-[300px] h-auto"
              priority
              style={{ background: "transparent" }}
            />
            <Image
              src="/mockupLaptop.png"
              alt="Dish Display on laptop"
              width={350}
              height={224}
              className="w-[300px] md:w-[350px] h-auto"
              priority
              style={{ background: "transparent" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
