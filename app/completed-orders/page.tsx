// "use client";

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Search } from "lucide-react";
// import Sidebar from "@/components/Sidebar";

// interface CompletedContract {
//   _id: string;
//   gig: {
//     _id: string;
//     title: string;
//   };
//   agreedAmount: number;
//   rating?: number;
//   client: { name: string };
//   freelancer: { name: string };
//   createdAt: string;
// }

// export default function CompletedOrdersPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [contracts, setContracts] = useState<CompletedContract[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     if (status === "unauthenticated") router.push("/login");
//   }, [status, router]);

//   useEffect(() => {
//     if (status === "authenticated") {
//       fetchCompletedContracts();
//     }
//   }, [status]);

//   const fetchCompletedContracts = async () => {
//     try {
//       const res = await fetch("/api/user/contracts?status=approved");
//       if (res.ok) {
//         const data = await res.json();
//         setContracts(data.contracts);
//       }
//     } catch (error) {
//       console.error("Error fetching completed contracts:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (status === "loading" || loading) {
//     return (
//       <p className="text-center mt-10 text-slate-400">Loading...</p>
//     );
//   }
//   const filteredContracts = contracts.filter((contract) => {
//     if (!searchQuery.trim()) return true;
//     const query = searchQuery.toLowerCase();
//     return (
//       contract.gig.title.toLowerCase().includes(query) ||
//       contract.client.name.toLowerCase().includes(query) ||
//       contract.freelancer.name.toLowerCase().includes(query)
//     );
//   });

//   return (
//     <div className="max-w-6xl mx-auto px-2 sm:px-0 mt-10 sm:mt-0">
//       <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
//         Completed Orders
//       </h1>

//       {/* Search Bar */}
//       {contracts.length > 0 && (
//         <div className="mb-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <Input
//               type="text"
//               placeholder="Search completed orders by title, client, or freelancer..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-400"
//             />
//           </div>
//         </div>
//       )}

//       {contracts.length === 0 ? (
//         <div className="text-center py-12">
//           <p className="text-gray-400 text-lg">No completed orders yet.</p>
//           <p className="text-gray-500 text-sm mt-1">
//             Your finished projects will appear here.
//           </p>
//         </div>
//       ) : filteredContracts.length === 0 ? (
//         <div className="text-center py-12">
//           <p className="text-gray-400 text-lg">No orders match your search.</p>
//           <p className="text-gray-500 text-sm mt-1">
//             Try a different search term.
//           </p>
//         </div>
//       ) : (
//         // <div className="space-y-2">.
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
//           {filteredContracts.map((contract) => {
//             const rating = contract.rating;
//             return (
//               <Card
//                 key={contract._id}
//                 className="h-full bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-0.5"
//               >
//                 <CardContent className="p-3 space-y-1">
//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

//                     {/* LEFT */}
//                     <div className="min-w-0">
//                       <p className="text-white font-medium text-sm sm:text-base truncate">
//                         {contract.gig.title}
//                       </p>

//                       <p className="text-xs sm:text-sm text-gray-400">
//                         {session?.user?.role === "client"
//                           ? `Freelancer: ${contract.freelancer.name}`
//                           : `Client: ${contract.client.name}`}
//                         <span className="mx-2">•</span>
//                         Completed on{" "}
//                         {new Date(contract.createdAt).toLocaleDateString()}
//                       </p>

//                       {/* Rating */}
//                       {typeof rating === "number" && (
//                         <div className="flex items-center gap-1 mt-1">
//                           {[1, 2, 3, 4, 5].map((star) => (
//                             <span
//                               key={star}
//                               className={`text-sm ${star <= rating
//                                   ? "text-yellow-400"
//                                   : "text-gray-600"
//                                 }`}
//                             >
//                               ★
//                             </span>
//                           ))}
//                           <span className="text-xs text-gray-400 ml-1">
//                             ({rating}/5)
//                           </span>
//                         </div>
//                       )}
//                     </div>

//                     {/* RIGHT */}
//                     <div className="flex items-center justify-between sm:justify-end gap-3">
//                       <span className="text-green-400 font-semibold text-sm sm:text-base whitespace-nowrap">
//                         ₹{contract.agreedAmount}
//                       </span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );

// }

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") fetchCompletedContracts();
  }, [status]);

  const fetchCompletedContracts = async () => {
    try {
      const res = await fetch("/api/user/contracts?status=approved");
      if (res.ok) {
        const data = await res.json();
        setContracts(data.contracts);
      }
    } catch (err) {
      console.error("Error fetching completed contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <p className="text-center mt-10 text-slate-400">Loading...</p>;
  }

  const filteredContracts = contracts.filter((contract) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      contract.gig.title.toLowerCase().includes(q) ||
      contract.client.name.toLowerCase().includes(q) ||
      contract.freelancer.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-0 mt-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
        Completed Orders
      </h1>

      {/* Search */}
      {contracts.length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, client or freelancer..."
              className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-400"
            />
          </div>
        </div>
      )}

      {filteredContracts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No completed orders found.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 sm:gap-4">
          {filteredContracts.map((contract) => {
            const rating = contract.rating;

            return (
              <Card
                key={contract._id}
                className="h-full bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-0.5"
              >
                <CardContent>

                  {/* TWO COLUMN LAYOUT */}
                  <div className="grid grid-cols-[1fr_auto] gap-3 items-start">

                    {/* LEFT COLUMN */}
                    <div className="space-y-1 min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base truncate">
                        {contract.gig.title}
                      </p>

                      <p className="text-xs sm:text-sm text-gray-400">
                        {session?.user?.role === "client"
                          ? `Freelancer: ${contract.freelancer.name}`
                          : `Client: ${contract.client.name}`}
                      </p>

                      <p className="text-xs text-gray-500">
                        Completed on{" "}
                        {new Date(contract.createdAt).toLocaleDateString()}
                      </p>

                      {typeof rating === "number" && (
                        <div className="flex items-center gap-1 pt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${star <= rating
                                ? "text-yellow-400"
                                : "text-gray-600"
                                }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-xs text-gray-400 ml-1">
                            ({rating}/5)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN (₹) */}
                    <div className="text-green-400 font-semibold text-sm sm:text-base whitespace-nowrap">
                      ₹{contract.agreedAmount}
                    </div>

                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
