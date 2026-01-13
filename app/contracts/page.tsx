"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">
        My Active Contracts
      </h1>

      {contracts.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No active contracts.</p>
      ) : (
        <div className="grid gap-6">
          {contracts.map((contract) => (
            <Card key={contract._id} className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex justify-between items-start">
                  <span className="text-lg">{contract.gig.title}</span>
                  <span className="text-xl font-bold text-green-400">${contract.agreedAmount}</span>
                </CardTitle>
                <p className="text-gray-300">
                  {session?.user?.role === "client" ? `Freelancer: ${contract.freelancer.name}` : `Client: ${contract.client.name}`}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Status: <span className="text-blue-400">{contract.status}</span></span>
                  <Button
                    onClick={() => router.push(`/gigs/${contract.gig._id}`)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}