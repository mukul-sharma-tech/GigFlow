"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  createdAt: string;
}

interface GigCardProps {
  gig: Gig;
}

export default function GigCard({ gig }: GigCardProps) {
  const router = useRouter();

return (
  <Card className="
    bg-white dark:bg-white/5
    backdrop-blur-xl
    border border-slate-200 dark:border-white/10
    shadow-sm
  ">
    <CardHeader>
      <CardTitle className="text-slate-900 dark:text-slate-100">
        {gig.title}
      </CardTitle>

      <p className="text-slate-600 dark:text-slate-400">
        By {gig.client.name}
        {gig.client.companyName && ` (${gig.client.companyName})`}
      </p>
    </CardHeader>

    <CardContent>
      <p className="text-slate-700 dark:text-slate-300 mb-4 line-clamp-3">
        {gig.description}
      </p>

      <div className="flex justify-between items-center mb-4">
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
          ${gig.budget}
        </span>

        {gig.deadline && (
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            Deadline: {new Date(gig.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      <Button
        onClick={() => router.push(`/gigs/${gig._id}`)}
        className="
          w-full
          bg-slate-900 text-white
          hover:bg-slate-800
          dark:bg-slate-100 dark:text-slate-900
          dark:hover:bg-slate-200
        "
      >
        View Details
      </Button>
    </CardContent>
  </Card>
);

}