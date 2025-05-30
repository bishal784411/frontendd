"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderKanban, Plus, Calendar, Users, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  clientName: string;
  budget: number;
  department: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'on-hold';
  assignedEmployees: string[];
  progress: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState({
    name: '',
    clientName: '',
    budget: '',
    department: 'Web Development',
    startDate: '',
    endDate: '',
    assignedEmployees: [] as string[],
  });

  const departments = ['Web Development', 'Data Analysis', 'Public Impact'];
  const mockEmployees = [
    { id: '1', name: 'John Doe', department: 'Web Development' },
    { id: '2', name: 'Jane Smith', department: 'Data Analysis' },
    { id: '3', name: 'Mike Johnson', department: 'Public Impact' },
  ];

  const handleAddProject = () => {
    if (!newProject.name || !newProject.clientName || !newProject.budget || !newProject.startDate || !newProject.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      ...newProject,
      budget: parseFloat(newProject.budget),
      status: 'active',
      progress: 0,
    };

    setProjects([...projects, project]);
    setNewProject({
      name: '',
      clientName: '',
      budget: '',
      department: 'Web Development',
      startDate: '',
      endDate: '',
      assignedEmployees: [],
    });
    toast.success('Project added successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <FolderKanban className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage and track company projects</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {projects.filter(p => p.status === 'active').length}
            </p>
            <p className="text-sm text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {projects.filter(p => p.status === 'completed').length}
            </p>
            <p className="text-sm text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Hours tracked</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Project List</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Name</label>
                  <Input
                    placeholder="Enter project name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={newProject.department}
                    onChange={(e) => setNewProject({ ...newProject, department: e.target.value })}
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client Name</label>
                  <Input
                    placeholder="Enter client name"
                    value={newProject.clientName}
                    onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Budget</label>
                  <Input
                    type="number"
                    placeholder="Enter project budget"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Employees</label>
                <div className="grid grid-cols-2 gap-2">
                  {mockEmployees
                    .filter(emp => emp.department === newProject.department)
                    .map(employee => (
                      <label key={employee.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newProject.assignedEmployees.includes(employee.id)}
                          onChange={(e) => {
                            const employees = e.target.checked
                              ? [...newProject.assignedEmployees, employee.id]
                              : newProject.assignedEmployees.filter(id => id !== employee.id);
                            setNewProject({ ...newProject, assignedEmployees: employees });
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{employee.name}</span>
                      </label>
                    ))}
                </div>
              </div>
              <Button className="w-full" onClick={handleAddProject}>
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No projects found. Add your first project to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{project.name}</CardTitle>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Client</span>
                      <span className="font-medium">{project.clientName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium">${project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{project.assignedEmployees.length} team members</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>0 hours tracked</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Department</span>
                        <span className="font-medium">{project.department}</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}