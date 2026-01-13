// "use client";

// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// interface Gig {
//   _id: string;
//   title: string;
//   description: string;
//   budget: number;
//   deadline?: string;
//   client: {
//     name: string;
//     companyName: string;
//   };
//   createdAt: string;
// }

// interface GigCardProps {
//   gig: Gig;
// }

// export default function GigCard({ gig }: GigCardProps) {
//   const router = useRouter();

// return (
//   <Card className="
//     bg-white dark:bg-white/5
//     backdrop-blur-xl
//     border border-slate-200 dark:border-white/10
//     shadow-sm
//   ">
//     <CardHeader className="p-4 sm:p-6">
//       <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-slate-100 break-words">
//         {gig.title}
//       </CardTitle>

//       <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 break-words">
//         By {gig.client.name}
//         {gig.client.companyName && ` (${gig.client.companyName})`}
//       </p>
//     </CardHeader>

//     <CardContent className="p-4 sm:p-6 pt-0">
//       <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-4 line-clamp-3 break-words">
//         {gig.description}
//       </p>

//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
//         <span className="text-base sm:text-lg text-emerald-600 dark:text-emerald-400 font-semibold">
//           ₹{gig.budget}
//         </span>

//         {gig.deadline && (
//           <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
//             Deadline: {new Date(gig.deadline).toLocaleDateString()}
//           </span>
//         )}
//       </div>

//       <Button
//         onClick={() => router.push(`/gigs/${gig._id}`)}
//         className="
//           w-full
//           bg-slate-900 text-white
//           hover:bg-slate-800
//           dark:bg-slate-100 dark:text-slate-900
//           dark:hover:bg-slate-200
//           text-sm sm:text-base
//         "
//       >
//         View Details
//       </Button>
//     </CardContent>
//   </Card>
// );

// }
// "use client";

// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";

// interface Gig {
//   _id: string;
//   title: string;
//   description: string;
//   budget: number;
//   deadline?: string;
//   client: {
//     name: string;
//     companyName: string;
//   };
//   createdAt: string;
// }

// interface GigCardProps {
//   gig: Gig;
// }

// export default function GigCard({ gig }: GigCardProps) {
//   const router = useRouter();

//   return (
// <Card className="h-full transition-transform hover:-translate-y-1 hover:shadow-lg">
//       <CardContent className="p-3 sm:p-4 space-y-2">

//         {/* Title */}
//         <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 truncate">
//           {gig.title}
//         </p>

//         {/* Client */}
//         <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
//           {gig.client.name}
//           {gig.client.companyName && ` • ${gig.client.companyName}`}
//         </p>

//         {/* Description */}
//         <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
//           {gig.description}
//         </p>

//         {/* Footer */}
//         <div className="flex items-center justify-between pt-1">
//           <span className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400">
//             ₹{gig.budget}
//           </span>

//           <Button
//             size="sm"
//             onClick={() => router.push(`/gigs/${gig._id}`)}
//             className="h-8 px-3 text-xs sm:text-sm"
//           >
//             View
//           </Button>
//         </div>

//       </CardContent>
//     </Card>
//   );
// }

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
