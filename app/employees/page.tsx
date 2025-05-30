'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search, Mail, Phone, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
  status: 'active' | 'inactive';
  employmentType: 'full-time' | 'part-time';
}

const initialEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@example.com',
    phone: '+1 (555) 123-4567',
    department: 'Web Development',
    position: 'HR Manager',
    joinDate: '2023-01-01',
    status: 'active',
    employmentType: 'full-time'
  },
  {
    id: '2',
    name: 'Jane Employee',
    email: 'employee@example.com',
    phone: '+1 (555) 234-5678',
    department: 'Engineering',
    position: 'Software Engineer',
    joinDate: '2023-02-01',
    status: 'active',
    employmentType: 'full-time'
  },
  {
    id: '3',
    name: 'Michael Smith',
    email: 'michael.smith@example.com',
    phone: '+1 (555) 345-6789',
    department: 'Data Analysis',
    position: 'Data Scientist',
    joinDate: '2023-03-15',
    status: 'active',
    employmentType: 'full-time'
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 456-7890',
    department: 'Public Impact',
    position: 'Project Manager',
    joinDate: '2023-04-01',
    status: 'active',
    employmentType: 'full-time'
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.w@example.com',
    phone: '+1 (555) 567-8901',
    department: 'Web Development',
    position: 'Frontend Developer',
    joinDate: '2023-05-01',
    status: 'active',
    employmentType: 'full-time'
  },
  {
    id: '6',
    name: 'Emily Brown',
    email: 'emily.b@example.com',
    phone: '+1 (555) 678-9012',
    department: 'Engineering',
    position: 'Backend Developer',
    joinDate: '2023-06-15',
    status: 'active',
    employmentType: 'part-time'
  },
  {
    id: '7',
    name: 'James Taylor',
    email: 'james.t@example.com',
    phone: '+1 (555) 789-0123',
    department: 'Data Analysis',
    position: 'Data Analyst',
    joinDate: '2023-07-01',
    status: 'inactive',
    employmentType: 'full-time'
  },
  {
    id: '8',
    name: 'Lisa Anderson',
    email: 'lisa.a@example.com',
    phone: '+1 (555) 890-1234',
    department: 'Public Impact',
    position: 'Community Manager',
    joinDate: '2023-08-01',
    status: 'active',
    employmentType: 'part-time'
  }
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Web Development',
    position: '',
    joinDate: '',
    password: '',
    employmentType: 'full-time' as const,
  });

  const departments = ['Web Development', 'Data Analysis', 'Public Impact', 'Engineering'];

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.department || !newEmployee.position || !newEmployee.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newEmployee.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    const employee: Employee = {
      id: Date.now().toString(),
      ...newEmployee,
      status: 'active',
      employmentType: newEmployee.employmentType,
    };

    setEmployees([...employees, employee]);
    setNewEmployee({
      name: '',
      email: '',
      phone: '',
      department: 'Web Development',
      position: '',
      joinDate: '',
      password: '',
      employmentType: 'full-time',
    });
    toast.success('Employee added successfully');
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    setEmployeeToDelete(null);
    toast.success('Employee deleted successfully');
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Manage company employees</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{employees.length}</p>
            <p className="text-sm text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{departments.length}</p>
            <p className="text-sm text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {employees.filter(emp => 
                new Date(emp.joinDate).getMonth() === new Date().getMonth()
              ).length}
            </p>
            <p className="text-sm text-muted-foreground">Recent additions</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="Enter employee name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  placeholder="Enter phone number"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select
                  value={newEmployee.department}
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input
                  placeholder="Enter position"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Employment Type</label>
                <Select
                  value={newEmployee.employmentType}
                  onValueChange={(value: 'full-time' | 'part-time') => 
                    setNewEmployee({ ...newEmployee, employmentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Join Date</label>
                <Input
                  type="date"
                  value={newEmployee.joinDate}
                  onChange={(e) => setNewEmployee({ ...newEmployee, joinDate: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleAddEmployee}>
                Add Employee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6">
        {filteredEmployees.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No employees found. Add your first employee to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        employee.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status}
                      </span>
                      <AlertDialog open={employeeToDelete === employee.id} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setEmployeeToDelete(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {employee.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => handleDeleteEmployee(employee.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {employee.email}
                    </div>
                    {employee.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        {employee.phone}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium">{employee.department}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Employment Type</span>
                      <span className="font-medium capitalize">{employee.employmentType}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Joined</span>
                      <span className="font-medium">
                        {new Date(employee.joinDate).toLocaleDateString()}
                      </span>
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