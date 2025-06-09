'use client';


// import { createUserApi } from '@/api/user';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTicketStore } from '@/lib/ticket-store';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TicketIcon, Plus, Search, Filter, Eye, Trash2, Mail, Phone, Building2, Calendar, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';

const departments = [
  "Web Development",
  "Data Analytics",
  "Public Impact",
];

const sampleEmployees = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1 (555) 123-4567',
    department: 'Web Development',
    position: 'Senior Developer',
    joinDate: '2023-01-15',
    status: 'active',
    employmentType: 'full-time',
    role: 'admin',
    address: '123 Tech Street, Suite 100, San Francisco, California',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=faces',
    documents: {
      panCard: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop',
      idType: 'passport',
      idDocument: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop'
    },
    bankDetails: {
      accountHolder: 'John Smith',
      accountNumber: '1234 1234 1234',
      bankName: 'National Bank',
      panId: 'ABCDE1234F',
      bankAddress: '123 Banking Street, Finance District'
    }
  }
];

const emptyEmployeeForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  department: 'Web Development',
  position: '',
  joinDate: format(new Date(), 'yyyy-MM-dd'),
  employmentType: 'full-time' as 'full-time' | 'part-time',
  role: 'employee' as 'employee' | 'admin',
  address: '',
  bankDetails: {
    accountHolder: '',
    accountNumber: '',
    bankName: '',
    panId: '',
    bankAddress: ''
  }
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(sampleEmployees);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [newEmployee, setNewEmployee] = useState<typeof emptyEmployeeForm>(emptyEmployeeForm);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password || !newEmployee.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
  
    // Build payload only with fields you want to send now
    const payload = {
      name: newEmployee.name,
      email: newEmployee.email,
      password: newEmployee.password,
      phone: newEmployee.phone,
      roleId: newEmployee.role === 'admin' ? 1 : 2,
      fullTimer: newEmployee.employmentType === 'full-time',
      address: newEmployee.address,
      document: 'test docs',
      salary: 250,
    };
  
    console.log('Payload:', payload);
  
    try {
      // await createUserApi(payload);
      toast.success('User created successfully');
      setShowEmployeeForm(false); 
      setNewEmployee(emptyEmployeeForm);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };
  
  

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    toast.success('Employee deleted successfully');
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  return (
    <div className="p-2 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Employees</h1>
        <Button onClick={() => {
          setNewEmployee(emptyEmployeeForm);
          setIsEditing(false);
          setShowEmployeeForm(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>{isEditing ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {/* TODO: Implement department logic later
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
            */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <Input
                placeholder="Enter position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={newEmployee.role}
                onValueChange={(value: 'admin' | 'employee') => 
                  setNewEmployee({ ...newEmployee, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
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
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Full Address</label>
              <Input
                placeholder="Enter complete address"
                value={newEmployee.address}
                onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => {
              setShowEmployeeForm(false);
              setNewEmployee(emptyEmployeeForm);
              setIsEditing(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>
              {isEditing ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full sm:w-[200px]">
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

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Employee</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="hidden md:table-cell">Position</TableHead>
                    <TableHead className="hidden md:table-cell">Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={employee.avatar} alt={employee.name} />
                            <AvatarFallback>{employee.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                            <div className="md:hidden text-sm text-gray-500">{employee.department}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{employee.department}</TableCell>
                      <TableCell className="hidden md:table-cell">{employee.position}</TableCell>
                      <TableCell className="hidden md:table-cell">{format(new Date(employee.joinDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="border-0  w-full max-w-[95vw] max-h-[95vh] md:max-w-4xl md:max-h-[90vh] overflow-y-auto">
                              <DialogTitle>Employee Details</DialogTitle>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                  <Avatar className="h-20 w-20">
                                    {employee.avatar && (
                                      <AvatarImage src={employee.avatar} alt={employee.name} />
                                    )}
                                    <AvatarFallback>{employee.name.substring(0, 2)}</AvatarFallback>
                                  </Avatar>

                                    <div>
                                      <h3 className="text-xl font-semibold">{employee.name}</h3>
                                      <p className="text-gray-500">{employee.position}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Contact Information</h4>
                                    <div className="grid gap-2">
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="break-all">{employee.email}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span>{employee.phone}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="break-words">{employee.address}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span>{employee.department}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span>Joined {format(new Date(employee.joinDate), 'PP')}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Bank Details</h4>
                                    <div className="grid gap-2 text-sm">
                                      <div className="flex flex-col sm:flex-row sm:justify-between">
                                        <span className="text-gray-500">Account Holder</span>
                                        <span>{employee.bankDetails.accountHolder}</span>
                                      </div>
                                      <div className="flex flex-col sm:flex-row sm:justify-between">
                                        <span className="text-gray-500">Account Number</span>
                                        <span>{employee.bankDetails.accountNumber}</span>
                                      </div>
                                      <div className="flex flex-col sm:flex-row sm:justify-between">
                                        <span className="text-gray-500">Bank Name</span>
                                        <span>{employee.bankDetails.bankName}</span>
                                      </div>
                                      <div className="flex flex-col sm:flex-row sm:justify-between">
                                        <span className="text-gray-500">PAN ID</span>
                                        <span>{employee.bankDetails.panId}</span>
                                      </div>
                                      <div className="flex flex-col sm:flex-row sm:justify-between">
                                        <span className="text-gray-500">Bank Address</span>
                                        <span className="break-words">{employee.bankDetails.bankAddress}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-6">
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Documents</h4>
                                    <div className="grid gap-4">
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm">PAN Card</span>
                                          <Button variant="ghost" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                          </Button>
                                        </div>
                                        <div className="aspect-video rounded-lg border overflow-hidden">
                                          <img
                                            src={employee.documents.panCard}
                                            alt="PAN Card"
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm">ID Document ({employee.documents.idType})</span>
                                          <Button variant="ghost" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                          </Button>
                                        </div>
                                        <div className="aspect-video rounded-lg border overflow-hidden">
                                          <img
                                            src={employee.documents.idDocument}
                                            alt="ID Document"
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this employee? This action cannot be undone.
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}