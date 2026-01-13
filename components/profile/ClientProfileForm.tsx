"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClientProfileData {
  companyName: string;
  companyInfo: {
    description: string;
    industry: string;
    website: string;
    location: string;
  };
}

interface ClientProfileFormProps {
  initialData: {
    companyName: string;
    companyInfo?: {
      description?: string;
      industry?: string;
      website?: string;
      location?: string;
    };
  };
  onSave: (data: ClientProfileData) => Promise<void>;
}

export default function ClientProfileForm({ initialData, onSave }: ClientProfileFormProps) {
  const [companyName, setCompanyName] = useState(initialData.companyName || "");
  const [description, setDescription] = useState(initialData.companyInfo?.description || "");
  const [industry, setIndustry] = useState(initialData.companyInfo?.industry || "");
  const [website, setWebsite] = useState(initialData.companyInfo?.website || "");
  const [location, setLocation] = useState(initialData.companyInfo?.location || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({
        companyName,
        companyInfo: {
          description,
          industry,
          website,
          location,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Client Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter your company name"
          />
        </div>

        <div>
          <Label htmlFor="description">Company Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your company"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g., Technology, Marketing, Design"
          />
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://www.example.com"
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
          />
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </CardContent>
    </Card>
  );
}