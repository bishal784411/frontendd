"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FolderKanban, Plus, Calendar, Users, Clock, Eye, Trash2, Archive, ChevronLeft, ChevronRight, Search, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useAuth } from '@/lib/auth-context';
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string;
  clientName: string;
  budget: number;
  department: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'archived';
  assignedEmployees: string[];
}


const demoProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform Redesign',
    description: 'Complete overhaul of the existing e-commerce platform with modern UI/UX principles, improved performance, and enhanced security features.',
    clientName: 'TechRetail Solutions',
    budget: 85000,
    department: 'Web Development',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    status: 'active',
    assignedEmployees: ['1', '2', '3']
  },
  {
    id: '2',
    name: 'Data Analytics Dashboard',
    description: 'Development of a comprehensive analytics dashboard with real-time data visualization, custom reporting, and predictive analytics capabilities.',
    clientName: 'Analytics Corp',
    budget: 65000,
    department: 'Data Analysis',
    startDate: '2024-04-01',
    endDate: '2024-07-31',
    status: 'active',
    assignedEmployees: ['2', '3']
  }
];

const departments = ['Web Development', 'Data Analysis', 'Public Impact'];

const mockEmployees = [
  { id: '1', name: 'John Admin', department: 'Web Development', role: 'Senior Developer' },
  { id: '2', name: 'Jane Employee', department: 'Data Analysis', role: 'Data Analyst' },
  { id: '3', name: 'Mike Johnson', department: 'Public Impact', role: 'Project Manager' },
  { id: '4', name: 'Sarah Wilson', department: 'Web Development', role: 'Frontend Developer' },
  { id: '5', name: 'David Brown', department: 'Data Analysis', role: 'Data Scientist' },
  { id: '6', name: 'Emily Davis', department: 'Public Impact', role: 'Community Manager' },
];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    clientName: '',
    budget: '',
    department: 'Web Development',
    startDate: '',
    endDate: '',
    assignedEmployees: [] as string[],
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeePopoverOpen, setEmployeePopoverOpen] = useState(false);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string | null>(null);

  const filteredEmployees = mockEmployees
    .filter(emp => 
      (!selectedDepartmentFilter || emp.department === selectedDepartmentFilter) &&
      (emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
       emp.role.toLowerCase().includes(employeeSearch.toLowerCase()))
    );

  const handleAddProject = () => {
    if (!newProject.name || !newProject.description || !newProject.clientName || !newProject.budget || !newProject.startDate || !newProject.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      ...newProject,
      budget: parseFloat(newProject.budget),
      status: 'active',
    };

    setProjects([...projects, project]);
    setNewProject({
      name: '',
      description: '',
      clientName: '',
      budget: '',
      department: 'Web Development',
      startDate: '',
      endDate: '',
      assignedEmployees: [],
    });
    toast.success('Project added successfully');
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    toast.success('Project deleted successfully');
  };

  const handleArchiveProject = (id: string) => {
    setProjects(projects.map(p => 
      p.id === id ? { ...p, status: 'archived' } : p
    ));
    toast.success('Project archived successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredProjects = projects.filter(project => {
    const matchesDepartment = departmentFilter === 'all' || project.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDepartment && matchesStatus && matchesSearch;
  });

  const projectsPerPage = 10;
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

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
        {user?.role?.name === 'Admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Archived Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {projects.filter(p => p.status === 'archived').length}
              </p>
              <p className="text-sm text-muted-foreground">Completed projects</p>
            </CardContent>
          </Card>
        )}

        {user?.role?.name === 'Admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Total Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                ${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Across all projects</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-4 flex-1">
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {user?.role?.name === 'Admin' && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        {user?.role?.name === 'Admin' && (
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
                    <Select
                      value={newProject.department}
                      onValueChange={(value) => {
                        setNewProject({
                          ...newProject,
                          department: value,
                          assignedEmployees: []
                        });
                        setSelectedDepartmentFilter(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Description</label>
                  <Textarea
                    placeholder="Enter project description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="min-h-[100px]"
                  />
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
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Assign Team Members</label>
                    <span className="text-sm text-muted-foreground">
                      {newProject.assignedEmployees.length} selected
                    </span>
                  </div>
                  <Popover open={employeePopoverOpen} onOpenChange={setEmployeePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        Select team members
                        <Users className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search employees..."
                          value={employeeSearch}
                          onValueChange={setEmployeeSearch}
                        />
                        <CommandList>
                          <CommandEmpty>No employees found.</CommandEmpty>
                          <CommandGroup>
                            <div className="p-2">
                              <Select
                                value={selectedDepartmentFilter || "all"}
                                onValueChange={(value) => setSelectedDepartmentFilter(value === "all" ? null : value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Filter by department" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Departments</SelectItem>
                                  {departments.map((dept) => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <CommandSeparator />
                            {filteredEmployees.map((employee) => (
                              <CommandItem
                                key={employee.id}
                                onSelect={() => {
                                  setNewProject(prev => ({
                                    ...prev,
                                    assignedEmployees: prev.assignedEmployees.includes(employee.id)
                                      ? prev.assignedEmployees.filter(id => id !== employee.id)
                                      : [...prev.assignedEmployees, employee.id]
                                  }));
                                }}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div>
                                    <p className="font-medium">{employee.name}</p>
                                    <p className="text-sm text-muted-foreground">{employee.role}</p>
                                  </div>
                                  <div className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded-sm border",
                                    newProject.assignedEmployees.includes(employee.id)
                                      ? "bg-primary border-primary"
                                      : "border-input"
                                  )}>
                                    {newProject.assignedEmployees.includes(employee.id) && (
                                      <Check className="h-3 w-3 text-primary-foreground" />
                                    )}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {newProject.assignedEmployees.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {newProject.assignedEmployees.map(id => {
                        const employee = mockEmployees.find(emp => emp.id === id);
                        return employee && (
                          <div
                            key={employee.id}
                            className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                          >
                            <span>{employee.name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => setNewProject(prev => ({
                                ...prev,
                                assignedEmployees: prev.assignedEmployees.filter(empId => empId !== employee.id)
                              }))}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <Button className="w-full" onClick={handleAddProject}>
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="mt-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead className="min-w-[150px]">Project Name</TableHead>
                  <TableHead className="hidden md:table-cell">Client</TableHead>
                  {user?.role?.name === 'Admin' && <TableHead className="hidden md:table-cell">Budget</TableHead>}
                  <TableHead>Department</TableHead>
                  <TableHead className="hidden md:table-cell">Start Date</TableHead>
                  <TableHead className="hidden md:table-cell">End Date</TableHead>
                  {user?.role?.name === 'Admin' && <TableHead className="hidden md:table-cell">Status</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {currentProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.role?.name === 'Admin' ? 8 : 7} className="text-center text-muted-foreground h-24">
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                currentProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{project.clientName}</TableCell>
                    {user?.role?.name === 'Admin' && (
                      <TableCell className="hidden md:table-cell">${project.budget.toLocaleString()}</TableCell>
                    )}
                    <TableCell>{project.department}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(project.startDate)}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(project.endDate)}</TableCell>
                    {user?.role?.name === 'Admin' && (
                      <TableCell className="hidden md:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[600px] h-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
                            <DialogTitle>{project.name}</DialogTitle>
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                                <p className="text-sm">{project.description}</p>
                              </div>
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
                                  <p className="text-sm text-muted-foreground">Status</p>
                                  <p className="font-medium capitalize">{project.status}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Timeline</p>
                                <p className="font-medium">
                                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Team Members</p>
                                <p className="font-medium">
                                  {mockEmployees
                                    .filter(emp => project.assignedEmployees.includes(emp.id))
                                    .map(emp => emp.name)
                                    .join(', ')}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {user?.role?.name === 'Admin' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleArchiveProject(project.id)}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex items-center px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}