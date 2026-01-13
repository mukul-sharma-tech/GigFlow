"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-400 dark:text-slate-100">Proposals</h2>
      {proposals.map((proposal) => (
        <Card key={proposal._id} className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-slate-200 dark:text-slate-100 flex justify-between items-center">
              <span>{proposal.freelancer.name}</span>
              <span className="text-green-200 dark:text-green-400 font-bold">${proposal.proposedAmount}</span>
            </CardTitle>
            <p className="text-slate-200 dark:text-slate-400">{proposal.freelancer.email}</p>
            {proposal.freelancer.rating && (
              <p className="text-slate-200 dark:text-slate-400">
                Rating: {proposal.freelancer.rating}/5 ({proposal.freelancer.totalReviews} reviews)
              </p>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-slate-200 dark:text-slate-300 mb-4">{proposal.coverLetter}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-200 dark:text-slate-400">Delivery: {proposal.deliveryTime} days</span>
              <span className="text-slate-200 dark:text-slate-400">Status: {proposal.status}</span>
            </div>
            {proposal.status === "pending" && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(proposal._id)}
                  disabled={approving === proposal._id}
                >
                  {approving === proposal._id ? "Approving..." : "Accept"}
                </Button>
                <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600">
                  Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}