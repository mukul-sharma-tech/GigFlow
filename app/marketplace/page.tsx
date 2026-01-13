"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GigCard from "@/components/GigCard";
import PostGigForm from "@/components/PostGigForm";
import Sidebar from "@/components/Sidebar";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface Gig {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline?: string;
  client: {
    _id: string;
    name: string;
    companyName: string;
  };
  createdAt: string;
}

export default function MarketplacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostGigModal, setShowPostGigModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchGigs();
    }
  }, [status]);

  const fetchGigs = async () => {
    try {
      const res = await fetch("/api/gigs");
      if (res.ok) {
        const data = await res.json();
        setGigs(data.gigs);
      }
    } catch (error) {
      console.error("Error fetching gigs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostGig = async (data: { title: string; description: string; budget: number; deadline?: string }) => {
    try {
      const res = await fetch("/api/gigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setShowPostGigModal(false);
        fetchGigs(); // Refresh the list
      } else {
        toast.error("Failed to post gig");
      }
    } catch (error) {
      console.error("Error posting gig:", error);
      toast.error("Error posting gig");
    }
  };


  if (status === "loading" || loading) {
    return (
      <p className="text-center mt-10 text-slate-400">Loading...</p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 mt-10 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Marketplace
        </h1>
        {session?.user?.role === "client" && (
          <Button
            onClick={() => setShowPostGigModal(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto text-sm sm:text-base"
          >
            Post a Gig
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search gigs by title, description, or client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      {(() => {
        const filteredGigs = gigs.filter((gig) => {
          if (!searchQuery.trim()) return true;
          const query = searchQuery.toLowerCase();
          return (
            gig.title.toLowerCase().includes(query) ||
            gig.description.toLowerCase().includes(query) ||
            gig.client.name.toLowerCase().includes(query) ||
            gig.client.companyName?.toLowerCase().includes(query)
          );
        });

        return filteredGigs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">
              {gigs.length === 0
                ? "No gigs available at the moment."
                : "No gigs match your search."}
            </p>
            <p className="text-gray-500 mt-2">
              {gigs.length === 0
                ? "Check back later for new opportunities."
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredGigs.map((gig) => (
              <GigCard key={gig._id} gig={gig} />
            ))}
          </div>
        );
      })()}

      {/* Post Gig Modal */}
      {showPostGigModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 lg:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Post a New Gig</h2>
              <button
                onClick={() => setShowPostGigModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                ✕
              </button>
            </div>
            <PostGigForm onSubmit={handlePostGig} />
          </div>
        </div>
      )}
    </div>
  );
}