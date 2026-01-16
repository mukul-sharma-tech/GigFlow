"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

interface GigCardProps {
  gig: Gig;
}

export default function GigCard({ gig }: GigCardProps) {
  const router = useRouter();

  return (
    <Card className="h-full bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-2">

          {/* Title */}
          <p className="text-white text-sm sm:text-base font-medium truncate">
            {gig.title}
          </p>

          {/* Client */}
          <p className="text-xs sm:text-sm text-gray-400 truncate">
            <Link
              href={`/profile/${gig.client._id}`}
              className="hover:text-blue-400 transition-colors"
            >
              {gig.client.name}
            </Link>
            {gig.client.companyName && ` • ${gig.client.companyName}`}
          </p>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
            {gig.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-green-400 font-semibold text-sm sm:text-base">
              ₹{gig.budget}
            </span>

            <Button
              size="sm"
              onClick={() => router.push(`/gigs/${gig._id}`)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-8 px-3 text-xs sm:text-sm"
            >
              View
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
