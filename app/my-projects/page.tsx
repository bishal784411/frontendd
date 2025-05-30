"use client";

import { useState } from "react";
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Clock, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  department: string;
  clientName: string;
  budget: number;
  startDate: string;
  endDate: string;
  progress: number;
  status: "active" | "completed" | "on-hold";
  assignedEmployees: string[];
}

export default function MyProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Website Redesign',
      department: 'Web Development',
      clientName: 'Tech Corp',
      budget: 50000,
      startDate: '2024-03-01',
      endDate: '2024-06-30',
      progress: 35,
      status: 'active',
      assignedEmployees: ['2'] // Employee ID
    },
    {
      id: '2',
      name: 'Mobile App Development',
      department: 'Web Development',
      clientName: 'StartUp Inc',
      budget: 75000,
      startDate: '2024-02-15',
      endDate: '2024-08-15',
      progress: 20,
      status: 'active',
      assignedEmployees: ['2'] // Employee ID
    }
  ]);

  // Filter projects to only show those assigned to the current user
  const userProjects = projects.filter(project => 
    project.assignedEmployees.includes(user?.id || '')
  );

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      case "on-hold":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Briefcase className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground">Track and manage your assigned projects</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userProjects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.department}</CardDescription>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Client</p>
                    <p className="font-medium">{project.clientName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-medium">${project.budget.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">{format(new Date(project.startDate), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p className="font-medium">{format(new Date(project.endDate), "MMM d, yyyy")}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{project.assignedEmployees.length} members</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {userProjects.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No projects assigned to you yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}