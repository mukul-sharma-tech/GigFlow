"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Contract {
  _id: string;
  gig: {
    _id: string;
    title: string;
    status: string;
  };
  agreedAmount: number;
  status: string;
  client: { name: string };
  freelancer: { name: string };
}

export default function ContractsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchContracts();
    }
  }, [status]);

  const fetchContracts = async () => {
    try {
      const res = await fetch("/api/user/contracts?excludeStatus=approved");
      if (res.ok) {
        const data = await res.json();
        setContracts(data.contracts);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <p className="text-center mt-10 text-slate-400">Loading...</p>
    );
  }
  const filteredContracts = contracts.filter((contract) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      contract.gig.title.toLowerCase().includes(query) ||
      contract.client.name.toLowerCase().includes(query) ||
      contract.freelancer.name.toLowerCase().includes(query) ||
      contract.status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-2 mt-10 sm:px-0">
      <h1 className="text-2xl font-bold text-white mb-4">
        My Active Contracts
      </h1>

      {/* Search Bar */}
      {contracts.length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search contracts by title, client, freelancer, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-400"
            />
          </div>
        </div>
      )}
  
      {contracts.length === 0 ? (
        <p className="text-gray-400 text-center py-6">
          No active contracts.
        </p>
      ) : filteredContracts.length === 0 ? (
        <p className="text-gray-400 text-center py-6">
          No contracts match your search.
        </p>
      ) : (
        <div className="space-y-2">
          {filteredContracts.map((contract) => (
            <Card
              key={contract._id}
              className="bg-white/5 border border-white/10 hover:border-white/20 transition"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  
                  {/* Left Section */}
                  <div className="min-w-0">
                    <p className="text-white text-sm sm:text-base font-medium truncate">
                      {contract.gig.title}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {session?.user?.role === "client"
                        ? `Freelancer: ${contract.freelancer.name}`
                        : `Client: ${contract.client.name}`}
                      <span className="ml-2 text-blue-400">
                        • {contract.status}
                      </span>
                    </p>
                  </div>
  
                  {/* Right Section */}
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-green-400 font-semibold text-sm sm:text-base">
                      ₹{contract.agreedAmount}
                    </span>
  
                    <Button
                      size="sm"
                      onClick={() => router.push(`/gigs/${contract.gig._id}`)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
  
}