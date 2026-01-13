"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Globe, Building } from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  companyName?: string;
  role: "client" | "freelancer";
  walletBalance: number;
  hourlyRate?: number;
  rating?: number;
  totalReviews?: number;
  skills?: string[];
  about?: {
    summary?: string;
    experience?: string;
    projects?: Array<{
      name: string;
      description: string;
      link?: string;
    }>;
  };
  companyInfo?: {
    description?: string;
    industry?: string;
    website?: string;
    location?: string;
  };
}

interface PastProject {
  _id: string;
  title: string;
  completedAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [pastProjects, setPastProjects] = useState<PastProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
        const data = await response.json();
        setUser(data.user);
        setPastProjects(data.pastProjects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-red-400">
          {error || "User not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid gap-6">
        {/* Profile Header */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-white">{user.name}</CardTitle>
                <p className="text-gray-400">{user.email}</p>
                <Badge
                  variant={user.role === "freelancer" ? "default" : "secondary"}
                  className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                >
                  {user.role === "freelancer" ? "Freelancer" : "Client"}
                </Badge>
              </div>
              {user.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-white">{user.rating.toFixed(1)}</span>
                  <span className="text-gray-400">
                    ({user.totalReviews} reviews)
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Freelancer Profile */}
        {user.role === "freelancer" && (
          <>
            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="border-white/20 text-white">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
    
            {/* About */}
            {user.about && (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.about.summary && (
                    <div>
                      <h4 className="font-semibold mb-2 text-white">Summary</h4>
                      <p className="text-gray-300">{user.about.summary}</p>
                    </div>
                  )}
                  {user.about.experience && (
                    <div>
                      <h4 className="font-semibold mb-2 text-white">Experience</h4>
                      <p className="text-gray-300">{user.about.experience}</p>
                    </div>
                  )}
                  {user.about.projects && user.about.projects.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-white">Projects</h4>
                      <div className="space-y-2">
                        {user.about.projects.map((project, index) => (
                          <div key={index} className="border-l-2 border-blue-500 pl-4">
                            <h5 className="font-medium text-white">{project.name}</h5>
                            <p className="text-sm text-gray-400">
                              {project.description}
                            </p>
                            {project.link && (
                              <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 text-sm hover:underline"
                              >
                                View Project
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
    
            {/* Hourly Rate */}
            {user.hourlyRate && (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-400">${user.hourlyRate}/hour</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Client Profile */}
        {user.role === "client" && (
          <>
            {/* Company Information */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.companyName && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-white">{user.companyName}</span>
                  </div>
                )}
                {user.companyInfo?.description && (
                  <div>
                    <h4 className="font-semibold mb-2 text-white">Description</h4>
                    <p className="text-gray-300">{user.companyInfo.description}</p>
                  </div>
                )}
                {user.companyInfo?.industry && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Industry:</span>
                    <span className="text-white">{user.companyInfo.industry}</span>
                  </div>
                )}
                {user.companyInfo?.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a
                      href={user.companyInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {user.companyInfo.website}
                    </a>
                  </div>
                )}
                {user.companyInfo?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{user.companyInfo.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>
    
            {/* Past Projects */}
            {pastProjects.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Past Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pastProjects.map((project) => (
                      <div key={project._id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                        <h4 className="font-medium text-white">{project.title}</h4>
                        <p className="text-sm text-gray-400">
                          Completed on {new Date(project.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}