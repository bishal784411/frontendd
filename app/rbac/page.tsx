"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Plus, Edit, Trash2, Users, Key, Settings, Search, Eye, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRBACStore, Role, Permission } from "@/lib/rbac-store";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";

// Mock employees data - in a real app, this would come from your employee store
const mockEmployees = [
    {
        id: '1',
        name: 'John Admin',
        email: 'john.admin@company.com',
        department: 'Management',
        position: 'HR Manager',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=faces',
    },
    {
        id: '2',
        name: 'Jane Employee',
        email: 'jane.employee@company.com',
        department: 'Engineering',
        position: 'Software Engineer',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=256&h=256&fit=crop&crop=faces',
    },
    {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        department: 'Data Analysis',
        position: 'Data Analyst',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
    },
    {
        id: '4',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        department: 'Web Development',
        position: 'Frontend Developer',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&h=256&fit=crop&crop=faces',
    },
    {
        id: '5',
        name: 'David Brown',
        email: 'david.brown@company.com',
        department: 'Public Impact',
        position: 'Project Manager',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
    },
    {
        id: '6',
        name: 'Lisa Garcia',
        email: 'lisa.garcia@company.com',
        department: 'Engineering',
        position: 'Backend Developer',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces',
    },
];

export default function RBACPage() {
    const { user } = useAuth();
    const {
        roles,
        permissions,
        priorityLevels,
        addRole,
        updateRole,
        deleteRole,
        addPermission,
        updatePermission,
        deletePermission,
        addPriorityLevel,
        updatePriorityLevel,
        deletePriorityLevel,
    } = useRBACStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTab, setSelectedTab] = useState("roles");
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

    // Employee assignment states
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [showEmployeeAssignment, setShowEmployeeAssignment] = useState(false);
    const [assigningToRole, setAssigningToRole] = useState<Role | null>(null);

    // Role form state
    const [roleForm, setRoleForm] = useState({
        name: "",
        description: "",
        priority: 1,
        priorityLabel: "",
        permissions: [] as string[],
        assignedEmployees: [] as string[],
        isActive: true,
    });
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [showRoleDialog, setShowRoleDialog] = useState(false);

    // Permission form state
    const [permissionForm, setPermissionForm] = useState({
        name: "",
        description: "",
        resource: "",
        action: "",
    });
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);

    // Priority level form state
    const [priorityForm, setPriorityForm] = useState({
        value: 1,
        label: "",
    });
    const [editingPriority, setEditingPriority] = useState<{ value: number; label: string } | null>(null);
    const [showPriorityDialog, setShowPriorityDialog] = useState(false);

    const departments = Array.from(new Set(mockEmployees.map(emp => emp.department)));

    const handleRoleSubmit = () => {
        if (!roleForm.name || !roleForm.description) {
            toast.error("Please fill in all required fields");
            return;
        }

        const priorityLevel = priorityLevels.find(p => p.value === roleForm.priority);
        const roleData = {
            ...roleForm,
            priorityLabel: priorityLevel?.label || `Level ${roleForm.priority}`,
        };

        if (editingRole) {
            updateRole(editingRole.id, roleData);
            toast.success("Role updated successfully");
        } else {
            addRole(roleData);
            toast.success("Role created successfully");
        }

        setRoleForm({
            name: "",
            description: "",
            priority: 1,
            priorityLabel: "",
            permissions: [],
            assignedEmployees: [],
            isActive: true,
        });
        setEditingRole(null);
        setShowRoleDialog(false);
    };

    const handlePermissionSubmit = () => {
        if (!permissionForm.name || !permissionForm.resource || !permissionForm.action) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (editingPermission) {
            updatePermission(editingPermission.id, permissionForm);
            toast.success("Permission updated successfully");
        } else {
            addPermission(permissionForm);
            toast.success("Permission created successfully");
        }

        setPermissionForm({
            name: "",
            description: "",
            resource: "",
            action: "",
        });
        setEditingPermission(null);
        setShowPermissionDialog(false);
    };

    const handlePrioritySubmit = () => {
        if (!priorityForm.label || priorityForm.value < 1) {
            toast.error("Please provide a valid priority level and label");
            return;
        }

        if (editingPriority) {
            updatePriorityLevel(editingPriority.value, priorityForm.label);
            toast.success("Priority level updated successfully");
        } else {
            if (priorityLevels.some(p => p.value === priorityForm.value)) {
                toast.error("Priority level already exists");
                return;
            }
            addPriorityLevel(priorityForm.value, priorityForm.label);
            toast.success("Priority level created successfully");
        }

        setPriorityForm({ value: 1, label: "" });
        setEditingPriority(null);
        setShowPriorityDialog(false);
    };

    const handleEditRole = (role: Role) => {
        setRoleForm({
            name: role.name,
            description: role.description,
            priority: role.priority,
            priorityLabel: role.priorityLabel,
            permissions: role.permissions,
            assignedEmployees: (role as any).assignedEmployees || [],
            isActive: role.isActive,
        });
        setEditingRole(role);
        setShowRoleDialog(true);
    };

    const handleEditPermission = (permission: Permission) => {
        setPermissionForm({
            name: permission.name,
            description: permission.description,
            resource: permission.resource,
            action: permission.action,
        });
        setEditingPermission(permission);
        setShowPermissionDialog(true);
    };

    const handleEditPriority = (priority: { value: number; label: string }) => {
        setPriorityForm({
            value: priority.value,
            label: priority.label,
        });
        setEditingPriority(priority);
        setShowPriorityDialog(true);
    };

    const handleAssignEmployees = (role: Role) => {
        setAssigningToRole(role);
        setEmployeeSearchTerm("");
        setSelectedDepartment("all");
        setShowEmployeeAssignment(true);
    };

    const handleEmployeeAssignment = (employeeId: string, isAssigned: boolean) => {
        if (!assigningToRole) return;

        const currentAssignments = (assigningToRole as any).assignedEmployees || [];
        let newAssignments;

        if (isAssigned) {
            newAssignments = [...currentAssignments, employeeId];
        } else {
            newAssignments = currentAssignments.filter((id: string) => id !== employeeId);
        }

        updateRole(assigningToRole.id, { assignedEmployees: newAssignments });
        setAssigningToRole({ ...assigningToRole, assignedEmployees: newAssignments } as any);
    };

    const removeEmployeeFromRole = (roleId: string, employeeId: string) => {
        const role = roles.find(r => r.id === roleId);
        if (!role) return;

        const currentAssignments = (role as any).assignedEmployees || [];
        const newAssignments = currentAssignments.filter((id: string) => id !== employeeId);

        updateRole(roleId, { assignedEmployees: newAssignments });
        toast.success("Employee removed from role");
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPermissions = permissions.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.action.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEmployees = mockEmployees.filter(employee => {
        const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment;
        const matchesSearch =
            employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
            employee.department.toLowerCase().includes(employeeSearchTerm.toLowerCase());
        return matchesDepartment && matchesSearch;
    });

    const groupedPermissions = permissions.reduce((acc, permission) => {
        if (!acc[permission.resource]) {
            acc[permission.resource] = [];
        }
        acc[permission.resource].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    const getEmployeeById = (id: string) => mockEmployees.find(emp => emp.id === id);

    return (
        <div className="container mx-auto py-4 md:py-8 px-4">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
                <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Role-Based Access Control</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Manage roles, permissions, and access levels</p>
                </div>
            </div>

            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 mb-6 md:mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base md:text-lg">Total Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl md:text-4xl font-bold">{roles.length}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Active roles</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base md:text-lg">Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl md:text-4xl font-bold">{permissions.length}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Available permissions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base md:text-lg">Priority Levels</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl md:text-4xl font-bold">{priorityLevels.length}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Defined levels</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="roles" className="flex items-center gap-2 text-xs md:text-sm">
                        <Users className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Roles</span>
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="flex items-center gap-2 text-xs md:text-sm">
                        <Key className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Permissions</span>
                    </TabsTrigger>
                    <TabsTrigger value="priorities" className="flex items-center gap-2 text-xs md:text-sm">
                        <Settings className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Priority Levels</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="roles" className="space-y-4 md:space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search roles..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                            <DialogTrigger asChild>
                                <Button onClick={() => {
                                    setRoleForm({
                                        name: "",
                                        description: "",
                                        priority: 1,
                                        priorityLabel: "",
                                        permissions: [],
                                        assignedEmployees: [],
                                        isActive: true,
                                    });
                                    setEditingRole(null);
                                }} className="w-full md:w-auto">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Role
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Role Name</label>
                                            <Input
                                                placeholder="Enter role name"
                                                value={roleForm.name}
                                                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Priority Level</label>
                                            <Select
                                                value={roleForm.priority.toString()}
                                                onValueChange={(value) => {
                                                    const priority = parseInt(value);
                                                    const priorityLevel = priorityLevels.find(p => p.value === priority);
                                                    setRoleForm({
                                                        ...roleForm,
                                                        priority,
                                                        priorityLabel: priorityLevel?.label || `Level ${priority}`,
                                                    });
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {priorityLevels.map((level) => (
                                                        <SelectItem key={level.value} value={level.value.toString()}>
                                                            {level.value} - {level.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea
                                            placeholder="Enter role description"
                                            value={roleForm.description}
                                            onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                        />
                                    </div>

                                    {/* Employee Assignment Section */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Assign Employees</label>
                                        <div className="border rounded-lg p-4 space-y-4">
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search employees..."
                                                        className="pl-10"
                                                        value={employeeSearchTerm}
                                                        onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                                    <SelectTrigger className="w-full md:w-[200px]">
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

                                            <div className="max-h-60 overflow-y-auto space-y-2">
                                                {filteredEmployees.map((employee) => (
                                                    <label key={employee.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded">
                                                        <Checkbox
                                                            checked={roleForm.assignedEmployees.includes(employee.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setRoleForm({
                                                                        ...roleForm,
                                                                        assignedEmployees: [...roleForm.assignedEmployees, employee.id],
                                                                    });
                                                                } else {
                                                                    setRoleForm({
                                                                        ...roleForm,
                                                                        assignedEmployees: roleForm.assignedEmployees.filter(id => id !== employee.id),
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={employee.avatar} alt={employee.name} />
                                                            <AvatarFallback>{employee.name.substring(0, 2)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-sm">{employee.name}</div>
                                                            <div className="text-xs text-muted-foreground">{employee.department} • {employee.position}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Permissions</label>
                                        <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-4">
                                            {Object.entries(groupedPermissions).map(([resource, perms]) => (
                                                <div key={resource} className="space-y-2">
                                                    <h4 className="font-medium capitalize">{resource}</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {perms.map((permission) => (
                                                            <label key={permission.id} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    checked={roleForm.permissions.includes(permission.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            setRoleForm({
                                                                                ...roleForm,
                                                                                permissions: [...roleForm.permissions, permission.id],
                                                                            });
                                                                        } else {
                                                                            setRoleForm({
                                                                                ...roleForm,
                                                                                permissions: roleForm.permissions.filter(id => id !== permission.id),
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                                <span className="text-sm">{permission.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={roleForm.isActive}
                                            onCheckedChange={(checked) => setRoleForm({ ...roleForm, isActive: checked as boolean })}
                                        />
                                        <label className="text-sm font-medium">Active Role</label>
                                    </div>
                                    <div className="flex justify-end gap-4">
                                        <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleRoleSubmit}>
                                            {editingRole ? "Update Role" : "Create Role"}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Roles Table */}
                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="min-w-[150px]">Role Name</TableHead>
                                        <TableHead className="hidden md:table-cell min-w-[200px]">Description</TableHead>
                                        <TableHead className="hidden sm:table-cell">Priority</TableHead>
                                        <TableHead className="hidden xl:table-cell">Permissions</TableHead>
                                        <TableHead className="min-w-[200px]">Assigned Employees</TableHead>
                                        <TableHead className="hidden md:table-cell">Status</TableHead>
                                        <TableHead className="w-[120px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRoles.map((role, index) => {
                                        const assignedEmployees = (role as any).assignedEmployees || [];
                                        return (
                                            <TableRow key={role.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                                <TableCell className="font-medium">
                                                    <div>
                                                        <div className="font-semibold">{role.name}</div>
                                                        <div className="md:hidden text-sm text-muted-foreground mt-1">
                                                            {role.description}
                                                        </div>
                                                        <div className="sm:hidden text-xs text-muted-foreground mt-1">
                                                            Priority: {role.priority} - {role.priorityLabel}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="max-w-[200px] truncate" title={role.description}>
                                                        {role.description}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <div className="text-sm">
                                                        <div className="font-medium">{role.priority}</div>
                                                        <div className="text-muted-foreground">{role.priorityLabel}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden xl:table-cell">
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.permissions.slice(0, 2).map((permId) => {
                                                            const permission = permissions.find(p => p.id === permId);
                                                            return permission ? (
                                                                <Badge key={permId} variant="outline" className="text-xs">
                                                                    {permission.name}
                                                                </Badge>
                                                            ) : null;
                                                        })}
                                                        {role.permissions.length > 2 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{role.permissions.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {assignedEmployees.slice(0, 2).map((empId: string) => {
                                                                const employee = getEmployeeById(empId);
                                                                return employee ? (
                                                                    <div key={empId} className="flex items-center gap-1 bg-muted/50 rounded px-2 py-1">
                                                                        <Avatar className="h-5 w-5">
                                                                            <AvatarImage src={employee.avatar} alt={employee.name} />
                                                                            <AvatarFallback className="text-xs">{employee.name.substring(0, 2)}</AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="text-xs">{employee.name.split(' ')[0]}</span>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground"
                                                                            onClick={() => removeEmployeeFromRole(role.id, empId)}
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                ) : null;
                                                            })}
                                                            {assignedEmployees.length > 2 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{assignedEmployees.length - 2}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs h-7"
                                                            onClick={() => handleAssignEmployees(role)}
                                                        >
                                                            <Users className="h-3 w-3 mr-1" />
                                                            Manage
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Badge variant={role.isActive ? "default" : "secondary"}>
                                                        {role.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={() => setSelectedRole(role)}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                                                <DialogHeader>
                                                                    <DialogTitle>Role Details: {selectedRole?.name}</DialogTitle>
                                                                </DialogHeader>
                                                                {selectedRole && (
                                                                    <div className="space-y-4">
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <div>
                                                                                <h4 className="font-medium mb-2">Basic Information</h4>
                                                                                <div className="space-y-2 text-sm">
                                                                                    <div><span className="text-muted-foreground">Name:</span> {selectedRole.name}</div>
                                                                                    <div><span className="text-muted-foreground">Priority:</span> {selectedRole.priority} - {selectedRole.priorityLabel}</div>
                                                                                    <div><span className="text-muted-foreground">Status:</span> {selectedRole.isActive ? "Active" : "Inactive"}</div>
                                                                                    <div><span className="text-muted-foreground">Created:</span> {format(new Date(selectedRole.createdAt), 'PPP')}</div>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="font-medium mb-2">Description</h4>
                                                                                <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <h4 className="font-medium mb-2">Assigned Employees ({((selectedRole as any).assignedEmployees || []).length})</h4>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                                {((selectedRole as any).assignedEmployees || []).map((empId: string) => {
                                                                                    const employee = getEmployeeById(empId);
                                                                                    return employee ? (
                                                                                        <div key={empId} className="flex items-center gap-2 p-2 border rounded">
                                                                                            <Avatar className="h-8 w-8">
                                                                                                <AvatarImage src={employee.avatar} alt={employee.name} />
                                                                                                <AvatarFallback>{employee.name.substring(0, 2)}</AvatarFallback>
                                                                                            </Avatar>
                                                                                            <div>
                                                                                                <div className="text-sm font-medium">{employee.name}</div>
                                                                                                <div className="text-xs text-muted-foreground">{employee.department}</div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : null;
                                                                                })}
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <h4 className="font-medium mb-2">Permissions ({selectedRole.permissions.length})</h4>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                                {selectedRole.permissions.map((permId) => {
                                                                                    const permission = permissions.find(p => p.id === permId);
                                                                                    return permission ? (
                                                                                        <div key={permId} className="flex items-center justify-between p-2 border rounded">
                                                                                            <span className="text-sm">{permission.name}</span>
                                                                                            <Badge variant="outline" className="text-xs">
                                                                                                {permission.action}
                                                                                            </Badge>
                                                                                        </div>
                                                                                    ) : null;
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditRole(role)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete this role? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        onClick={() => {
                                                                            deleteRole(role.id);
                                                                            toast.success("Role deleted successfully");
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {filteredRoles.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No roles found. Create your first role to get started.
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4 md:space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search permissions..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
                            <DialogTrigger asChild>
                                <Button onClick={() => {
                                    setPermissionForm({
                                        name: "",
                                        description: "",
                                        resource: "",
                                        action: "",
                                    });
                                    setEditingPermission(null);
                                }} className="w-full md:w-auto">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Permission
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingPermission ? "Edit Permission" : "Create New Permission"}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Permission Name</label>
                                        <Input
                                            placeholder="Enter permission name"
                                            value={permissionForm.name}
                                            onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Resource</label>
                                            <Input
                                                placeholder="e.g., users, projects"
                                                value={permissionForm.resource}
                                                onChange={(e) => setPermissionForm({ ...permissionForm, resource: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Action</label>
                                            <Input
                                                placeholder="e.g., create, read, update"
                                                value={permissionForm.action}
                                                onChange={(e) => setPermissionForm({ ...permissionForm, action: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea
                                            placeholder="Enter permission description"
                                            value={permissionForm.description}
                                            onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-4">
                                        <Button variant="outline" onClick={() => setShowPermissionDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handlePermissionSubmit}>
                                            {editingPermission ? "Update Permission" : "Create Permission"}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Permissions Table */}
                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="min-w-[150px]">Permission Name</TableHead>
                                        <TableHead className="hidden md:table-cell min-w-[200px]">Description</TableHead>
                                        <TableHead className="hidden sm:table-cell">Resource</TableHead>
                                        <TableHead className="hidden sm:table-cell">Action</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPermissions.map((permission, index) => (
                                        <TableRow key={permission.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                            <TableCell className="font-medium">
                                                <div>
                                                    <div className="font-semibold">{permission.name}</div>
                                                    <div className="md:hidden text-sm text-muted-foreground mt-1">
                                                        {permission.description}
                                                    </div>
                                                    <div className="sm:hidden text-xs text-muted-foreground mt-1">
                                                        {permission.resource} • {permission.action}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="max-w-[200px] truncate" title={permission.description}>
                                                    {permission.description}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Badge variant="outline" className="capitalize">
                                                    {permission.resource}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Badge variant="secondary" className="capitalize">
                                                    {permission.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" onClick={() => setSelectedPermission(permission)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Permission Details: {selectedPermission?.name}</DialogTitle>
                                                            </DialogHeader>
                                                            {selectedPermission && (
                                                                <div className="space-y-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div>
                                                                            <h4 className="font-medium mb-2">Basic Information</h4>
                                                                            <div className="space-y-2 text-sm">
                                                                                <div><span className="text-muted-foreground">Name:</span> {selectedPermission.name}</div>
                                                                                <div><span className="text-muted-foreground">Resource:</span> {selectedPermission.resource}</div>
                                                                                <div><span className="text-muted-foreground">Action:</span> {selectedPermission.action}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-medium mb-2">Description</h4>
                                                                            <p className="text-sm text-muted-foreground">{selectedPermission.description}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditPermission(permission)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Permission</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this permission? This will remove it from all roles.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    onClick={() => {
                                                                        deletePermission(permission.id);
                                                                        toast.success("Permission deleted successfully");
                                                                    }}
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

                    {filteredPermissions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No permissions found.
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="priorities" className="space-y-4 md:space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl md:text-2xl font-semibold">Priority Levels</h2>
                        <Dialog open={showPriorityDialog} onOpenChange={setShowPriorityDialog}>
                            <DialogTrigger asChild>
                                <Button onClick={() => {
                                    setPriorityForm({ value: 1, label: "" });
                                    setEditingPriority(null);
                                }} className="w-full md:w-auto">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Priority Level
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingPriority ? "Edit Priority Level" : "Create New Priority Level"}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Priority Value</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="100"
                                                placeholder="Enter priority value"
                                                value={priorityForm.value}
                                                onChange={(e) => setPriorityForm({ ...priorityForm, value: parseInt(e.target.value) || 1 })}
                                                disabled={!!editingPriority}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Priority Label</label>
                                            <Input
                                                placeholder="Enter priority label"
                                                value={priorityForm.label}
                                                onChange={(e) => setPriorityForm({ ...priorityForm, label: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4">
                                        <Button variant="outline" onClick={() => setShowPriorityDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handlePrioritySubmit}>
                                            {editingPriority ? "Update Priority" : "Create Priority"}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Priority Levels Table */}
                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Priority Value</TableHead>
                                        <TableHead>Priority Label</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {priorityLevels.map((level, index) => (
                                        <TableRow key={level.value} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                            <TableCell className="font-medium">
                                                <Badge variant="outline">Level {level.value}</Badge>
                                            </TableCell>
                                            <TableCell>{level.label}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditPriority(level)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Priority Level</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this priority level? This may affect existing roles.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    onClick={() => {
                                                                        deletePriorityLevel(level.value);
                                                                        toast.success("Priority level deleted successfully");
                                                                    }}
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
                </TabsContent>
            </Tabs>

            {/* Employee Assignment Dialog */}
            <Dialog open={showEmployeeAssignment} onOpenChange={setShowEmployeeAssignment}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Manage Employee Assignments - {assigningToRole?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search employees..."
                                    className="pl-10"
                                    value={employeeSearchTerm}
                                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                <SelectTrigger className="w-full md:w-[200px]">
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

                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {filteredEmployees.map((employee) => {
                                const isAssigned = assigningToRole && ((assigningToRole as any).assignedEmployees || []).includes(employee.id);
                                return (
                                    <label key={employee.id} className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded border">
                                        <Checkbox
                                            checked={isAssigned}
                                            onCheckedChange={(checked) => handleEmployeeAssignment(employee.id, checked as boolean)}
                                        />
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={employee.avatar} alt={employee.name} />
                                            <AvatarFallback>{employee.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-medium">{employee.name}</div>
                                            <div className="text-sm text-muted-foreground">{employee.email}</div>
                                            <div className="text-xs text-muted-foreground">{employee.department} • {employee.position}</div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={() => setShowEmployeeAssignment(false)}>
                                Done
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}