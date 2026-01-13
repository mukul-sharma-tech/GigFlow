"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FreelancerProfileForm from "@/components/profile/FreelancerProfileForm";
import ClientProfileForm from "@/components/profile/ClientProfileForm";
import Sidebar from "@/components/Sidebar";
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-lg text-gray-300">
          {userProfile.companyName || "Manage your freelance projects"}
        </p>
        <p className="text-sm text-gray-400 mt-1">Role: {userProfile.role}</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
          <Button
            onClick={() => setEditing(!editing)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {editing ? (
          <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/5 p-6">
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
          <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/5 p-6">
            {userProfile.role === "freelancer" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Skills</h3>
                  <p className="text-gray-300">{userProfile.skills?.join(", ") || "No skills added"}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Hourly Rate</h3>
                  <p className="text-green-400 font-semibold">${userProfile.hourlyRate || 0}/hr</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-white mb-2">Summary</h3>
                  <p className="text-gray-300">{userProfile.about?.summary || "No summary"}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-white mb-2">Experience</h3>
                  <p className="text-gray-300">{userProfile.about?.experience || "No experience"}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-white mb-2">Projects</h3>
                  {userProfile.about?.projects?.length ? (
                    <div className="space-y-3">
                      {userProfile.about.projects.map((proj, idx) => (
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
                  ) : (
                    <p className="text-gray-400">No projects</p>
                  )}
                </div>
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
