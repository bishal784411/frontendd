"use client";

import { useState } from "react";
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Eye, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

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

// Mock employees data
const mockEmployees = [
  { id: '1', name: 'John Admin', department: 'Web Development' },
  { id: '2', name: 'Jane Employee', department: 'Data Analysis' },
  { id: '3', name: 'Mike Johnson', department: 'Public Impact' },
];

const demoProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform Redesign',
    department: 'Web Development',
    clientName: 'TechRetail Solutions',
    budget: 85000,
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    progress: 35,
    status: 'active',
    assignedEmployees: ['1', '2', '3'] // Employee IDs
  },
  {
    id: '2',
    name: 'Data Analytics Dashboard',
    department: 'Data Analysis',
    clientName: 'Analytics Corp',
    budget: 65000,
    startDate: '2024-04-01',
    endDate: '2024-07-31',
    progress: 20,
    status: 'active',
    assignedEmployees: ['2', '3'] // Employee IDs
  }
];

export default function MyProjectsPage() {
  const { user } = useAuth();
  const [projects] = useState<Project[]>(demoProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter projects to only show those assigned to the current user
  const userProjects = projects.filter(project =>
    project.assignedEmployees.includes(user?.id || '')
  );

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Get team member names for a project
  const getTeamMembers = (employeeIds: string[]) => {
    return mockEmployees
      .filter(emp => employeeIds.includes(emp.id))
      .map(emp => emp.name);
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

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {userProjects.filter(p => p.status === 'active').length}
            </p>
            <p className="text-sm text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              ${userProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {Math.round(userProjects.reduce((sum, p) => sum + p.progress, 0) / userProjects.length || 0)}%
            </p>
            <p className="text-sm text-muted-foreground">Average completion</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                    No projects assigned to you yet
                  </TableCell>
                </TableRow>
              ) : (
                userProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.clientName}</TableCell>
                    <TableCell>${project.budget.toLocaleString()}</TableCell>
                    <TableCell>{project.department}</TableCell>
                    <TableCell>{formatDate(project.startDate)}</TableCell>
                    <TableCell>{formatDate(project.endDate)}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{project.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Client</p>
                                <p className="font-medium">{project.clientName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Budget</p>
                                <p className="font-medium">${project.budget.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Department</p>
                                <p className="font-medium">{project.department}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Progress</p>
                                <p className="font-medium">{project.progress}%</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Timeline</p>
                              <p className="font-medium">
                                {formatDate(project.startDate)} - {formatDate(project.endDate)}
                              </p>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Team Members ({project.assignedEmployees.length})</p>
                              </div>
                              <div className="space-y-1">
                                {getTeamMembers(project.assignedEmployees).map((name, index) => (
                                  <p key={index} className="text-sm font-medium">{name}</p>
                                ))}
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}