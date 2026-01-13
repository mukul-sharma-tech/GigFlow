"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import FreelancerProfileForm from "@/components/profile/FreelancerProfileForm";
import ClientProfileForm from "@/components/profile/ClientProfileForm";
import Sidebar from "@/components/Sidebar";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  email: string;
  companyName: string;
  role: "client" | "freelancer";
  walletBalance: number;
  hourlyRate?: number;
  rating?: number;
  totalReviews?: number;
  skills?: string[];
  about?: {
    summary?: string;
    experience?: string;
    projects?: { name: string; description: string; link?: string }[];
  };
}


export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleSaveProfile = async (data: unknown) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setUserProfile(updated.user);
        setEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    }
  };

  if (status === "loading" || loading) {
    return (
      <p className="text-center mt-10 text-slate-400">
        Loading...
      </p>
    );
  }

  if (!userProfile) {
    return (
      <p className="text-center mt-10 text-red-400">
        Failed to load profile.
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 mt-10 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      {/* Welcome Section */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-base sm:text-lg text-gray-300">
          {userProfile.companyName || "Manage your freelance projects"}
        </p>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">Role: {userProfile.role}</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Profile Settings</h2>
          <Button
            onClick={() => setEditing(!editing)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 w-full sm:w-auto text-sm sm:text-base"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {editing ? (
          <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/5 p-4 sm:p-6">
            {userProfile.role === "freelancer" ? (
              <FreelancerProfileForm
                initialData={{
                  skills: userProfile.skills || [],
                  about: userProfile.about || {},
                  hourlyRate: userProfile.hourlyRate,
                }}
                onSave={handleSaveProfile}
              />
            ) : (
              <ClientProfileForm
                initialData={{
                  companyName: userProfile.companyName || "",
                }}
                onSave={handleSaveProfile}
              />
            )}
          </div>
        ) : (
          <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/5 p-4 sm:p-6">
            {/* Search Bar for Profile Content */}
            {userProfile.role === "freelancer" && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search profile content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}
            {userProfile.role === "freelancer" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {(() => {
                  const query = searchQuery.toLowerCase();
                  const shouldShow = (content: string) => 
                    !searchQuery.trim() || content.toLowerCase().includes(query);

                  const skillsText = userProfile.skills?.join(", ") || "No skills added";
                  const summaryText = userProfile.about?.summary || "No summary";
                  const experienceText = userProfile.about?.experience || "No experience";
                  
                  const filteredProjects = userProfile.about?.projects?.filter((proj) =>
                    !searchQuery.trim() ||
                    proj.name.toLowerCase().includes(query) ||
                    proj.description.toLowerCase().includes(query)
                  ) || [];

                  return (
                    <>
                      {shouldShow(skillsText) && (
                        <div>
                          <h3 className="text-base sm:text-lg font-medium text-white mb-2">Skills</h3>
                          <p className="text-sm sm:text-base text-gray-300 break-words">{skillsText}</p>
                        </div>
                      )}
                      {shouldShow(`₹${userProfile.hourlyRate || 0}/hr`) && (
                        <div>
                          <h3 className="text-base sm:text-lg font-medium text-white mb-2">Hourly Rate</h3>
                          <p className="text-sm sm:text-base text-green-400 font-semibold">₹{userProfile.hourlyRate || 0}/hr</p>
                        </div>
                      )}
                      {shouldShow(summaryText) && (
                        <div className="md:col-span-2">
                          <h3 className="text-lg font-medium text-white mb-2">Summary</h3>
                          <p className="text-gray-300">{summaryText}</p>
                        </div>
                      )}
                      {shouldShow(experienceText) && (
                        <div className="md:col-span-2">
                          <h3 className="text-lg font-medium text-white mb-2">Experience</h3>
                          <p className="text-gray-300">{experienceText}</p>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-medium text-white mb-2">Projects</h3>
                        {filteredProjects.length > 0 ? (
                          <div className="space-y-3">
                            {filteredProjects.map((proj, idx) => (
                              <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <p className="text-white font-medium">{proj.name}</p>
                                <p className="text-gray-300 text-sm">{proj.description}</p>
                                {proj.link && (
                                  <a
                                    href={proj.link}
                                    className="text-blue-400 hover:text-blue-300 text-sm underline mt-1 inline-block"
                                  >
                                    View Project
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : userProfile.about?.projects?.length === 0 ? (
                          <p className="text-gray-400">No projects</p>
                        ) : searchQuery.trim() ? (
                          <p className="text-gray-400">No projects match your search.</p>
                        ) : null}
                      </div>
                      {searchQuery.trim() && 
                       !shouldShow(skillsText) && 
                       !shouldShow(`₹${userProfile.hourlyRate || 0}/hr`) && 
                       !shouldShow(summaryText) && 
                       !shouldShow(experienceText) && 
                       filteredProjects.length === 0 && (
                        <div className="md:col-span-2 text-center py-4">
                          <p className="text-gray-400">No profile content matches your search.</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Company Name</h3>
                <p className="text-gray-300">{userProfile.companyName || "No company name"}</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
