"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface ProposalFormProps {
  gigId: string;
}

export default function ProposalForm({ gigId }: ProposalFormProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedAmount, setProposedAmount] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(proposedAmount);
    const time = parseInt(deliveryTime);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid proposed amount greater than 0");
      return;
    }

    if (isNaN(time) || time <= 0) {
      toast.error("Please enter a valid delivery time greater than 0 days");
      return;
    }

    if (!coverLetter.trim()) {
      toast.error("Please enter a cover letter");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/gigs/${gigId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverLetter: coverLetter.trim(),
          proposedAmount: amount,
          deliveryTime: time,
        }),
      });
      if (res.ok) {
        toast.success("Proposal submitted successfully!");
        setCoverLetter("");
        setProposedAmount("");
        setDeliveryTime("");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to submit proposal");
      }
    } catch (error) {
      toast.error("Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  // return (
  //   <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
  //     <CardHeader>
  //       <CardTitle className="text-slate-400 dark:text-slate-100">Send Proposal</CardTitle>
  //     </CardHeader>
  //     <CardContent>
  //       <form onSubmit={handleSubmit} className="space-y-4">
  //         <div>
  //           <Label htmlFor="coverLetter" className="text-slate-200 dark:text-slate-100">Cover Letter</Label>
  //           <Textarea
  //             id="coverLetter"
  //             value={coverLetter}
  //             onChange={(e) => setCoverLetter(e.target.value)}
  //             required
  //             placeholder="Introduce yourself and explain why you're the best fit..."
  //             className="bg-slate-800 border-slate-600 text-slate-100"
  //             rows={6}
  //           />
  //         </div>
  //         <div className="grid grid-cols-2 gap-4">
  //           <div>
  //             <Label htmlFor="proposedAmount" className="text-slate-200 dark:text-slate-100">Proposed Amount ($)</Label>
  //             <Input
  //               id="proposedAmount"
  //               type="number"
  //               value={proposedAmount}
  //               onChange={(e) => setProposedAmount(e.target.value)}
  //               required
  //               min="1"
  //               step="0.01"
  //               className="bg-slate-800 border-slate-600 text-slate-100"
  //             />
  //           </div>
  //           <div>
  //             <Label htmlFor="deliveryTime" className="text-slate-200 dark:text-slate-100">Delivery Time (days)</Label>
  //             <Input
  //               id="deliveryTime"
  //               type="number"
  //               value={deliveryTime}
  //               onChange={(e) => setDeliveryTime(e.target.value)}
  //               required
  //               min="1"
  //               className="bg-slate-800 border-slate-600 text-slate-100"
  //             />
  //           </div>
  //         </div>
  //         <Button type="submit" disabled={submitting} className="w-full">
  //           {submitting ? "Submitting..." : "Submit Proposal"}
  //         </Button>
  //       </form>
  //     </CardContent>
  //   </Card>
  // );
  return (
  <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
    <CardHeader>
      <CardTitle className="text-slate-400 dark:text-slate-100">
        Send Proposal
      </CardTitle>
    </CardHeader>

    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Cover Letter */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="coverLetter"
            className="text-slate-200 dark:text-slate-100"
          >
            Cover Letter
          </Label>

          <Textarea
            id="coverLetter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            required
            placeholder="Introduce yourself and explain why you're the best fit..."
            className="bg-slate-800 border-slate-600 text-slate-100"
            rows={6}
          />
        </div>

        {/* Amount + Delivery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="proposedAmount"
              className="text-slate-200 dark:text-slate-100"
            >
              Proposed Amount (₹)
            </Label>

            <Input
              id="proposedAmount"
              type="number"
              value={proposedAmount}
              onChange={(e) => setProposedAmount(e.target.value)}
              required
              min="1"
              step="0.01"
              className="bg-slate-800 border-slate-600 text-slate-100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="deliveryTime"
              className="text-slate-200 dark:text-slate-100"
            >
              Delivery Time (days)
            </Label>

            <Input
              id="deliveryTime"
              type="number"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              required
              min="1"
              className="bg-slate-800 border-slate-600 text-slate-100"
            />
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Submitting..." : "Submit Proposal"}
        </Button>

      </form>
    </CardContent>
  </Card>
);

}