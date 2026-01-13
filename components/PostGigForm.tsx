"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PostGigFormProps {
  onSubmit: (data: { title: string; description: string; budget: number; deadline?: string }) => void;
}

export default function PostGigForm({ onSubmit }: PostGigFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        budget: parseFloat(budget),
        deadline: deadline || undefined,
      });
      setTitle("");
      setDescription("");
      setBudget("");
      setDeadline("");
      toast.success("Gig posted successfully!");
    } catch (error) {
      toast.error("Failed to post gig");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-slate-900 dark:text-slate-100">
          Title
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter gig title"
          className="
        bg-white dark:bg-slate-800
        text-slate-900 dark:text-slate-100
        placeholder:text-slate-400 dark:placeholder:text-slate-500
        border border-slate-300 dark:border-slate-600
        focus:ring-2 focus:ring-blue-500
      "
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-slate-900 dark:text-slate-100">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Describe the gig in detail"
          className="
        bg-white dark:bg-slate-800
        text-slate-900 dark:text-slate-100
        placeholder:text-slate-400 dark:placeholder:text-slate-500
        border border-slate-300 dark:border-slate-600
        focus:ring-2 focus:ring-blue-500
      "
        />
      </div>

      <div>
        <Label htmlFor="budget" className="text-slate-900 dark:text-slate-100">
          Budget ($)
        </Label>
        <Input
          id="budget"
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
          min="1"
          placeholder="Enter budget"
          className="
        bg-white dark:bg-slate-800
        text-slate-900 dark:text-slate-100
        placeholder:text-slate-400 dark:placeholder:text-slate-500
        border border-slate-300 dark:border-slate-600
        focus:ring-2 focus:ring-blue-500
      "
        />
      </div>

      <div>
        <Label htmlFor="deadline" className="text-slate-900 dark:text-slate-100">
          Deadline (optional)
        </Label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="
        bg-white dark:bg-slate-800
        text-slate-900 dark:text-slate-100
        border border-slate-300 dark:border-slate-600
        focus:ring-2 focus:ring-blue-500
      "
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="
      w-full
      bg-gradient-to-r from-blue-600 to-purple-600
      hover:from-blue-700 hover:to-purple-700
      text-white
      border-0
    "
      >
        {submitting ? "Posting..." : "Post Gig"}
      </Button>
    </form>

  );
}