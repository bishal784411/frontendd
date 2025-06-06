'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTimeSheetStore } from '@/lib/timesheet-store';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Eye, Users, Download, Search, ChevronRight, ChevronDown } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
import { TimeEntry } from '@/lib/types';
// import { Checkbox } from '@radix-ui/react-checkbox';
import { Checkbox } from '@/components/ui/checkbox';

// Single sample entry
const sampleTimeEntry: TimeEntry = {
  id: '1',
  userId: '2',
  employeeName: 'Jane Employee',
  projectName: 'Website Redesign',
  startTime: '2024-03-20T09:00:00.000Z',
  endTime: '2024-03-20T17:00:00.000Z',
  description: 'Implemented new dashboard features and optimized database queries',
  duration: 8,
  verified: false
};

export default function AdminTimesheetsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [collapsedEmployees, setCollapsedEmployees] = useState<string[]>([]);
  const [selectedEntriesByEmployee, setSelectedEntriesByEmployee] = useState<Record<string, string[]>>({});
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);

  const departments = ['Web Development', 'Data Analysis', 'Public Impact'];
  const employees = [
    { id: '1', name: 'John Admin', department: 'Web Development' },
    { id: '2', name: 'Jane Employee', department: 'Data Analysis' },
    { id: '3', name: 'Mike Johnson', department: 'Public Impact' }
  ];

  const toggleEmployee = (employeeId: string) => {
    setCollapsedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleVerifyEntries = (employeeName: string) => {
    const selectedEntries = selectedEntriesByEmployee[employeeName] || [];
    if (selectedEntries.length === 0) return;

    toast.success(`${selectedEntries.length} entries verified for ${employeeName}`);
    setSelectedEntriesByEmployee(prev => ({
      ...prev,
      [employeeName]: []
    }));
  };

  const handleMarkPending = (employeeName: string) => {
    const selectedEntries = selectedEntriesByEmployee[employeeName] || [];
    if (selectedEntries.length === 0) return;

    toast.success(`${selectedEntries.length} entries marked as pending for ${employeeName}`);
    setSelectedEntriesByEmployee(prev => ({
      ...prev,
      [employeeName]: []
    }));
  };

  const handleSelectAllForEmployee = (employeeName: string, entries: TimeEntry[], checked: boolean) => {
    setSelectedEntriesByEmployee(prev => ({
      ...prev,
      [employeeName]: checked ? entries.map(e => e.id) : []
    }));
  };

  const exportToCSV = (employeeName: string, entries: TimeEntry[]) => {
    const headers = ['Date', 'Project', 'Description', 'Start Time', 'End Time', 'Duration', 'Status'];
    const csvData = entries.map(entry => [
      format(parseISO(entry.startTime), 'yyyy-MM-dd'),
      entry.projectName,
      entry.description,
      format(parseISO(entry.startTime), 'HH:mm'),
      format(parseISO(entry.endTime), 'HH:mm'),
      `${entry.duration}h`,
      entry.verified ? 'Verified' : 'Pending'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${employeeName.replace(/\s+/g, '_')}_timesheet.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success(`Timesheet exported for ${employeeName}`);
  };

  // Filter employees based on department
  const filteredEmployees = employees.filter(emp =>
    selectedDepartment === 'all' || emp.department === selectedDepartment
  );

  // Group the sample entry by employee
  const groupedByEmployee = {
    [sampleTimeEntry.employeeName]: [sampleTimeEntry]
  };

  const filteredEmployeeData = Object.entries(groupedByEmployee)
    .filter(([employeeName, entries]) => {
      const employee = employees.find(emp => emp.name === employeeName);
      const matchesDepartment = selectedDepartment === 'all' || (employee && employee.department === selectedDepartment);
      const matchesEmployee = selectedEmployee === 'all' || employeeName === selectedEmployee;
      const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' ||
        (selectedStatus === 'verified' && entries.every(e => e.verified)) ||
        (selectedStatus === 'pending' && entries.some(e => !e.verified));

      return matchesDepartment && matchesEmployee && matchesSearch && matchesStatus;
    })
    .map(([employeeName, entries]) => ({
      employeeName,
      entries
    }));

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Clock className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timesheet Management</h1>
          <p className="text-muted-foreground">Review and manage employee timesheets</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {filteredEmployees.map(emp => (
                <SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select> */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6 mt-6">
        {filteredEmployeeData.map(({ employeeName, entries }) => {
          const isCollapsed = collapsedEmployees.includes(employeeName);
          const selectedEntries = selectedEntriesByEmployee[employeeName] || [];
          const allEntriesSelected = entries.length > 0 && entries.every(entry => selectedEntries.includes(entry.id));
          const someEntriesSelected = entries.some(entry => selectedEntries.includes(entry.id));

          return (
            <Card key={employeeName}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleEmployee(employeeName)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{employeeName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Total hours: {entries.reduce((sum, entry) => sum + entry.duration, 0).toFixed(1)}h
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportToCSV(employeeName, entries);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    {selectedEntries.length > 0 && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerifyEntries(employeeName);
                          }}
                        >
                          Verify Selected ({selectedEntries.length})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkPending(employeeName);
                          }}
                        >
                          Mark as Pending
                        </Button>
                      </>
                    )}
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {!isCollapsed && (
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-8 gap-4 p-4 font-medium border-b">
                      <div>Date</div>
                      <div>Project</div>
                      <div className="col-span-2">Description</div>
                      <div>Duration</div>
                      <div>Status</div>
                      <div>Actions</div>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={allEntriesSelected}
                          indeterminate={!allEntriesSelected && someEntriesSelected}
                          onCheckedChange={(checked) => {
                            handleSelectAllForEmployee(employeeName, entries, checked as boolean);
                          }}
                        />
                      </div>
                    </div>
                    <div className="divide-y">
                      {entries.map((entry) => (
                        <div key={entry.id} className="grid grid-cols-8 gap-4 p-4">
                          <div>{format(parseISO(entry.startTime), 'MMM d, yyyy')}</div>
                          <div>{entry.projectName}</div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              {entry.description}
                            </div>
                          </div>
                          <div>{entry.duration.toFixed(2)}h</div>
                          <div>
                            {entry.verified ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="flex justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedEntry(entry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={selectedEntries.includes(entry.id)}
                              onCheckedChange={(checked) => {
                                setSelectedEntriesByEmployee(prev => ({
                                  ...prev,
                                  [employeeName]: checked
                                    ? [...(prev[employeeName] || []), entry.id]
                                    : (prev[employeeName] || []).filter(id => id !== entry.id)
                                }));
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Time Entry Details</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(selectedEntry.startTime), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-medium">{selectedEntry.projectName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="font-medium">{format(new Date(selectedEntry.startTime), 'p')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Time</p>
                  <p className="font-medium">{format(new Date(selectedEntry.endTime), 'p')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedEntry.duration.toFixed(2)}h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{selectedEntry.verified ? 'Verified' : 'Pending'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{selectedEntry.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}