"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PostGigForm from "@/components/PostGigForm";

export default function PostGigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role !== "client") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const handleSubmit = async (data: { title: string; description: string; budget: number; deadline?: string }) => {
    const res = await fetch("/api/gigs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error("Failed to post gig");
    }
  };

  if (status === "loading") {
    return (
      <p className="text-center mt-10 text-slate-400">Loading...</p>
    );
  }

  if (session?.user?.role !== "client") {
    return null; // Will redirect
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10 bg-slate-100 dark:bg-[#0b1220]">
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-br
        from-slate-200 via-white to-blue-100
        dark:from-slate-900 dark:via-[#0b1220] dark:to-blue-900/40" />

      <div className="absolute -top-56 -left-56 w-[600px] h-[600px]
        bg-blue-300/40 dark:bg-blue-700/20 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 -right-60 w-[650px] h-[650px]
        bg-indigo-300/35 dark:bg-indigo-800/25 rounded-full blur-[140px]" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight mb-8">
          Post a Gig
        </h1>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <PostGigForm onSubmit={handleSubmit} />
        </div>
      </div>
    </main>
  );
}