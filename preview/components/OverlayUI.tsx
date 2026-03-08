"use client";

import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function OverlayUI() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.4 });

    if (titleRef.current && subRef.current) {
      tl.fromTo(
        titleRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
      ).fromTo(
        subRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
        "-=0.8"
      );
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    console.log("GEMINI 3 PRO: Analyzing user profile...");

    setTimeout(() => {
      console.log(
        "GEMINI 3 PRO: Profile categorized as 'High Net Worth / Penthouse Interest'"
      );
      setStatus("success");
    }, 2000);
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6 pointer-events-auto">
        <div className="text-xs uppercase tracking-[0.5em] text-luxury-gold">
          Tokyo Realty Club
        </div>
        <Link
          href="/demo"
          className="rounded-sm bg-luxury-gold px-6 py-2 font-sans font-semibold text-luxury-black transition-colors duration-300 hover:bg-white"
        >
          Demo
        </Link>
      </nav>
      <div className="pointer-events-auto w-full max-w-5xl px-6 text-center">
        <div className="mb-8 invisible">
          Spacer
        </div>

        <h1
          ref={titleRef}
          className="font-serif text-5xl leading-tight text-white opacity-0 md:text-7xl lg:text-8xl"
        >
          Unlock Elite <br />
          <span className="bg-gradient-to-r from-luxury-gold to-white bg-clip-text text-transparent">
            Tokyo Living
          </span>
        </h1>

        <p
          ref={subRef}
          className="mx-auto mb-12 mt-6 max-w-2xl font-sans text-lg text-luxury-white/70 opacity-0 md:text-xl"
        >
          Experience the pinnacle of urban luxury. A curated collection of
          penthouses and estates, powered by intelligence.
        </p>

        <div className="flex h-24 items-center justify-center">
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-serif text-2xl italic text-luxury-gold"
              >
                Welcome to the Club.
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ delay: 1.3, duration: 0.8 }}
                onSubmit={handleSubmit}
                className="relative flex w-full max-w-xl flex-col gap-4 md:flex-row"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                  className="flex-grow rounded-sm border border-luxury-white/15 bg-luxury-white/5 px-6 py-3 text-white backdrop-blur-sm transition-colors placeholder:text-white/25 focus:outline-none focus:border-luxury-gold disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="rounded-sm bg-luxury-gold px-8 py-3 font-sans font-semibold text-luxury-black transition-colors duration-300 hover:bg-white disabled:opacity-60"
                >
                  {status === "loading" ? "Authenticating..." : "Request Access"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-8 w-full text-center">
        <div className="mx-auto mb-4 h-px w-24 bg-luxury-gold/30" />
        <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-luxury-white/50">
          Powered by Gemini 3 Pro Architecture
        </p>
      </div>
    </div>
  );
}
