"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IProject {
  name: string;
  description: string;
  link?: string;
}

interface FreelancerProfileFormProps {
  initialData: {
    skills: string[];
    about: {
      summary?: string;
      experience?: string;
      projects?: IProject[];
    };
    hourlyRate?: number;
  };
  onSave: (data: any) => Promise<void>;
}

export default function FreelancerProfileForm({ initialData, onSave }: FreelancerProfileFormProps) {
  const [skills, setSkills] = useState<string[]>(initialData.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [summary, setSummary] = useState(initialData.about?.summary || "");
  const [experience, setExperience] = useState(initialData.about?.experience || "");
  const [projects, setProjects] = useState<IProject[]>(initialData.about?.projects || []);
  const [hourlyRate, setHourlyRate] = useState(initialData.hourlyRate || 0);
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addProject = () => {
    setProjects([...projects, { name: "", description: "", link: "" }]);
  };

  const updateProject = (index: number, field: keyof IProject, value: string) => {
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProjects(newProjects);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({
        skills,
        about: {
          summary,
          experience,
          projects: projects.filter(p => p.name.trim() || p.description.trim()),
        },
        hourlyRate,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Freelancer Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skills */}
        <div>
          <Label>Skills</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add a skill"
              onKeyPress={(e) => e.key === "Enter" && addSkill()}
            />
            <Button onClick={addSkill} type="button">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                {skill}
                <button onClick={() => removeSkill(skill)} className="text-red-500">&times;</button>
              </span>
            ))}
          </div>
        </div>

        {/* Hourly Rate */}
        <div>
          <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
          <Input
            id="hourlyRate"
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
          />
        </div>

        {/* About Summary */}
        <div>
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief introduction about yourself"
            rows={3}
          />
        </div>

        {/* Experience */}
        <div>
          <Label htmlFor="experience">Experience</Label>
          <Textarea
            id="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Detailed experience"
            rows={5}
          />
        </div>

        {/* Projects */}
        <div>
          <Label>Projects</Label>
          {projects.map((project, index) => (
            <div key={index} className="border p-4 rounded mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4>Project {index + 1}</h4>
                <Button onClick={() => removeProject(index)} variant="destructive" size="sm">Remove</Button>
              </div>
              <Input
                placeholder="Project Name"
                value={project.name}
                onChange={(e) => updateProject(index, "name", e.target.value)}
                className="mb-2"
              />
              <Textarea
                placeholder="Description"
                value={project.description}
                onChange={(e) => updateProject(index, "description", e.target.value)}
                rows={3}
                className="mb-2"
              />
              <Input
                placeholder="Link (optional)"
                value={project.link || ""}
                onChange={(e) => updateProject(index, "link", e.target.value)}
              />
            </div>
          ))}
          <Button onClick={addProject} type="button">Add Project</Button>
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </CardContent>
    </Card>
  );
}