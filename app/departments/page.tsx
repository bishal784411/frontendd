"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Trash2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Department {
  id: string;
  name: string;
  description: string;
  type: 'Web Development' | 'Data Analysis' | 'Public Impact';
  employeeCount: number;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([
    {
      id: '1',
      name: 'Web Development',
      description: 'Frontend and backend development services',
      type: 'Web Development',
      employeeCount: 0
    },
    {
      id: '2',
      name: 'Data Analysis',
      description: 'Data processing and analytics services',
      type: 'Data Analysis',
      employeeCount: 0
    },
    {
      id: '3',
      name: 'Public Impact',
      description: 'Public relations and social impact initiatives',
      type: 'Public Impact',
      employeeCount: 0
    }
  ]);

  const [newDepartment, setNewDepartment] = useState<{
    name: string;
    description: string;
    type: 'Web Development' | 'Data Analysis' | 'Public Impact';
  }>({
    name: '',
    description: '',
    type: 'Web Development'
  });


  const handleAddDepartment = () => {
    if (!newDepartment.name || !newDepartment.description) {
      toast.error('Please fill in all fields');
      return;
    }

    const department: Department = {
      id: Date.now().toString(),
      ...newDepartment,
      employeeCount: 0
    };

    setDepartments([...departments, department]);
    setNewDepartment({
      name: '',
      description: '',
      type: 'Web Development'
    });
    toast.success('Department added successfully');
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter(dept => dept.id !== id));
    toast.success('Department deleted successfully');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage company departments and services</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{departments.length}</p>
            <p className="text-sm text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">3</p>
            <p className="text-sm text-muted-foreground">Core service areas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {departments.reduce((sum, dept) => sum + dept.employeeCount, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Department List</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department Name</label>
                <Input
                  placeholder="Enter department name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Enter department description"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Type</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newDepartment.type}
                  onChange={(e) => setNewDepartment({ 
                    ...newDepartment, 
                    type: e.target.value as 'Web Development' | 'Data Analysis' | 'Public Impact'
                  })}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Data Analysis">Data Analysis</option>
                  <option value="Public Impact">Public Impact</option>
                </select>
              </div>
              <Button className="w-full" onClick={handleAddDepartment}>
                Add Department
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => (
          <Card key={department.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{department.name}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteDepartment(department.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{department.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                  {department.type}
                </span>
                <span>{department.employeeCount} employees</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}