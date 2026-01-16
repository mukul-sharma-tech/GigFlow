"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ProposalForm from "@/components/ProposalForm";
import ProposalsList from "@/components/ProposalsList";
import { toast } from "sonner";

interface Gig {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline?: string;
  client: {
    name: string;
    companyName: string;
  };
  status: string;
  createdAt: string;
}

interface Contract {
  _id: string;
  agreedAmount: number;
  status: string;
  freelancer: {
    name: string;
    email: string;
  };
  client: {
    name: string;
    email: string;
  };
  submission?: {
    message?: string;
    fileUrl?: string;
    submittedAt?: string;
  };
}

export default function GigPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gig, setGig] = useState<Gig | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { id } = use(params);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchGig();
      setIsClient(session?.user?.role === "client");
    }
  }, [status, session]);

  const fetchGig = async () => {
    try {
      const res = await fetch(`/api/gigs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setGig(data.gig);
        if (data.gig.status === "in_progress") {
          await fetchContract();
        }
      } else {
        router.push("/marketplace");
      }
    } catch (error) {
      console.error("Error fetching gig:", error);
      router.push("/marketplace");
    } finally {
      setLoading(false);
    }
  };

  const fetchContract = async () => {
    try {
      const res = await fetch(`/api/gigs/${id}/contract`);
      if (res.ok) {
        const data = await res.json();
        setContract(data.contract);
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <p className="text-center mt-10 text-slate-400">Loading...</p>
    );
  }

  if (!gig) {
    return (
      <p className="text-center mt-10 text-slate-400">Gig not found.</p>
    );
  }

  return (
    <div className="max-w-6xl mt-10 mx-auto space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader className="p-2 sm:p-3 pb-0 space-y-0">
          <CardTitle className="text-base sm:text-lg text-slate-200 dark:text-slate-100 truncate leading-tight">
            {gig.title}
          </CardTitle>

          <p className="text-xs sm:text-sm text-slate-200 dark:text-slate-400 truncate m-0 leading-tight">
            By {gig.client.name}{" "}
            {gig.client.companyName && `(${gig.client.companyName})`}
          </p>
        </CardHeader>

        <CardContent className="p-2 sm:p-3 pt-0">
          <p className="text-sm text-slate-200 dark:text-slate-300 truncate mb-2 mt-[-2px] leading-tight">
            {gig.description}
          </p>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-xs sm:text-sm">
            <span className="text-green-400 font-semibold">₹{gig.budget}</span>

            {gig.deadline && (
              <span className="text-slate-200 dark:text-slate-400">
                Deadline: {new Date(gig.deadline).toLocaleDateString()}
              </span>
            )}

            <span className="text-slate-200 dark:text-slate-400">
              Status: {gig.status}
            </span>
          </div>
        </CardContent>
      </Card>

      {contract ? (
        <ContractDetails contract={contract} isClient={isClient} />
      ) : isClient ? (
        <ProposalsList gigId={gig._id} />
      ) : (
        <ProposalForm gigId={gig._id} />
      )}
    </div>
  );
}

function ContractDetails({ contract, isClient }: { contract: Contract; isClient: boolean }) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmitWork = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/contracts/${contract._id}/submit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, fileUrl }),
      });
      if (res.ok) {
        // Refresh
        window.location.reload();
      } else {
        toast.error("Failed to submit work");
      }
    } catch (error) {
      console.error("Error submitting work:", error);
      toast.error("Error submitting work");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveWork = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/contracts/${contract._id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (res.ok) {
        // Refresh
        window.location.reload();
      } else {
        toast.error("Failed to approve work");
      }
    } catch (error) {
      console.error("Error approving work:", error);
      toast.error("Error approving work");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg text-slate-200 dark:text-slate-100">Contract Details</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-medium text-slate-200 dark:text-slate-100">Freelancer</h3>
            <p className="text-sm sm:text-base text-slate-200 dark:text-slate-400 break-words">{contract.freelancer.name} ({contract.freelancer.email})</p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-slate-200 dark:text-slate-100">Agreed Amount</h3>
            <p className="text-base sm:text-lg text-green-600 dark:text-green-400 font-bold">₹{contract.agreedAmount}</p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-slate-200 dark:text-slate-100">Status</h3>
            <p className="text-sm sm:text-base text-slate-200 dark:text-slate-400">{contract.status}</p>
          </div>
          {contract.submission && (
            <div>
              <h3 className="text-base sm:text-lg font-medium text-slate-200 dark:text-slate-100">Submission</h3>
              <p className="text-sm sm:text-base text-slate-200 dark:text-slate-400 break-words">{contract.submission.message}</p>
              {contract.submission.fileUrl && (
                <a href={contract.submission.fileUrl} className="text-sm sm:text-base text-blue-200 dark:text-blue-400 break-all">View File</a>
              )}
              <p className="text-xs sm:text-sm text-slate-200 dark:text-slate-400">Submitted at: {contract.submission.submittedAt ? new Date(contract.submission.submittedAt).toLocaleString() : "N/A"}</p>
            </div>
          )}
          {contract.status === "active" && !isClient && (
            <div className="space-y-2 sm:space-y-3">
              <Textarea
                placeholder="Submission message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
              />
              <Input
                placeholder="File URL"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="text-sm sm:text-base"
              />
              <Button onClick={handleSubmitWork} disabled={submitting} className="w-full sm:w-auto text-sm sm:text-base">
                {submitting ? "Submitting..." : "Submit Work"}
              </Button>
            </div>
          )}
          {contract.status === "work_submitted" && isClient && (
            <div className="space-y-2 sm:space-y-3">
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                Rate the Freelancer:
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`text-xl sm:text-2xl ${star <= (hoverRating || rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                      } hover:text-yellow-400 transition-colors`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-200 dark:text-slate-400">
                {rating} star{rating !== 1 ? "s" : ""}
              </p>
              <Button onClick={handleApproveWork} disabled={submitting} className="w-full sm:w-auto text-sm sm:text-base">
                {submitting ? "Approving..." : "Approve Work"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}