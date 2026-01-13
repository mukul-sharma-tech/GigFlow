"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";

interface CompletedContract {
  _id: string;
  gig: {
    _id: string;
    title: string;
  };
  agreedAmount: number;
  rating?: number;
  client: { name: string };
  freelancer: { name: string };
  createdAt: string;
}

export default function CompletedOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contracts, setContracts] = useState<CompletedContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCompletedContracts();
    }
  }, [status]);

  const fetchCompletedContracts = async () => {
    try {
      const res = await fetch("/api/user/contracts?status=approved");
      if (res.ok) {
        const data = await res.json();
        setContracts(data.contracts);
      }
    } catch (error) {
      console.error("Error fetching completed contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <p className="text-center mt-10 text-slate-400">Loading...</p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">
        Completed Orders
      </h1>

      {contracts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-xl">No completed orders yet.</p>
          <p className="text-gray-500 mt-2">Your finished projects will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {contracts.map((contract) => (
            <Card key={contract._id} className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex justify-between items-start">
                  <span className="text-xl">{contract.gig.title}</span>
                  <span className="text-2xl font-bold text-green-400">${contract.agreedAmount}</span>
                </CardTitle>
                <p className="text-gray-300">
                  {session?.user?.role === "client" ? `Freelancer: ${contract.freelancer.name}` : `Client: ${contract.client.name}`}
                </p>
                {contract.rating && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300">Rating:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${star <= contract.rating! ? 'text-yellow-400' : 'text-gray-600'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-300">({contract.rating}/5)</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Completed on: {new Date(contract.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}