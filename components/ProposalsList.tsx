"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Proposal {
  _id: string;
  coverLetter: string;
  proposedAmount: number;
  deliveryTime: number;
  status: string;
  freelancer: {
    name: string;
    email: string;
    rating?: number;
    totalReviews?: number;
  };
  createdAt: string;
}

interface ProposalsListProps {
  gigId: string;
}

export default function ProposalsList({ gigId }: ProposalsListProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProposals();
  }, [gigId]);

  const fetchProposals = async () => {
    try {
      const res = await fetch(`/api/gigs/${gigId}/proposals`);
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals);
        setError("");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to fetch proposals");
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (proposalId: string) => {
    setApproving(proposalId);
    try {
      const res = await fetch(`/api/gigs/${gigId}/proposals/${proposalId}`, {
        method: "PUT",
      });
      if (res.ok) {
        // Refresh proposals
        await fetchProposals();
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to approve proposal");
      }
    } catch (error) {
      console.error("Error approving proposal:", error);
      setError("Network error");
    } finally {
      setApproving(null);
    }
  };

  if (loading) {
    return <p className="text-slate-600 dark:text-slate-400">Loading proposals...</p>;
  }

  if (error) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-slate-200 dark:text-slate-100">Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-100 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-slate-400 dark:text-slate-100">Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-200 dark:text-slate-400">No proposals yet.</p>
        </CardContent>
      </Card>
    );
  }

  const filteredProposals = proposals.filter((proposal) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      proposal.freelancer.name.toLowerCase().includes(query) ||
      proposal.freelancer.email.toLowerCase().includes(query) ||
      proposal.coverLetter.toLowerCase().includes(query) ||
      proposal.status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-400 dark:text-slate-100">Proposals</h2>
        {proposals.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-400 text-sm"
            />
          </div>
        )}
      </div>
      {filteredProposals.length === 0 ? (
        <p className="text-gray-400 text-center py-6">
          {proposals.length === 0 ? "No proposals yet." : "No proposals match your search."}
        </p>
      ) : (
        filteredProposals.map((proposal) => (
        <Card key={proposal._id} className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-slate-200 dark:text-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <span className="break-words">{proposal.freelancer.name}</span>
              <span className="text-base sm:text-lg text-green-200 dark:text-green-400 font-bold whitespace-nowrap">₹{proposal.proposedAmount}</span>
            </CardTitle>
            <p className="text-sm sm:text-base text-slate-200 dark:text-slate-400 break-words">{proposal.freelancer.email}</p>
            {proposal.freelancer.rating && (
              <p className="text-sm sm:text-base text-slate-200 dark:text-slate-400">
                Rating: {proposal.freelancer.rating}/5 ({proposal.freelancer.totalReviews} reviews)
              </p>
            )}
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-sm sm:text-base text-slate-200 dark:text-slate-300 mb-4 break-words">{proposal.coverLetter}</p>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
              <span className="text-sm sm:text-base text-slate-200 dark:text-slate-400">Delivery: {proposal.deliveryTime} days</span>
              <span className="text-sm sm:text-base text-slate-200 dark:text-slate-400">Status: {proposal.status}</span>
            </div>
            {proposal.status === "pending" && (
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base"
                  onClick={() => handleApprove(proposal._id)}
                  disabled={approving === proposal._id}
                >
                  {approving === proposal._id ? "Approving..." : "Accept"}
                </Button>
                <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 w-full sm:w-auto text-sm sm:text-base">
                  Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))
      )}
    </div>
  );
}