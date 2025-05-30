"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Search, Check, X, ChevronDown, ChevronRight, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { toast } from 'sonner';
import { useTimeSheetStore } from '@/lib/timesheet-store';
import { TimeEntry } from '@/lib/types';

export default function AdminTimesheetsPage() {
  const { getAllEntries } = useTimeSheetStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [filterType, setFilterType] = useState<'current' | 'custom'>('current');
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [collapsedEmployees, setCollapsedEmployees] = useState<string[]>([]);

  const toggleEmployee = (employeeId: string) => {
    setCollapsedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleApproveEntry = (entry: TimeEntry) => {
    toast.success('Time entry approved');
    setSelectedEntry(null);
  };

  const handleRejectEntry = (entry: TimeEntry) => {
    toast.error('Time entry rejected');
    setSelectedEntry(null);
  };

  const allEntries = getAllEntries();

  // Filter entries based on date range
  const filterEntriesByDate = (entries: TimeEntry[]) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      
      if (filterType === 'current') {
        const currentMonth = startOfMonth(new Date());
        const currentMonthEnd = endOfMonth(new Date());
        return isWithinInterval(entryDate, { start: currentMonth, end: currentMonthEnd });
      }
      
      if (filterType === 'custom' && customDateRange.start && customDateRange.end) {
        const start = new Date(customDateRange.start);
        const end = new Date(customDateRange.end);
        return isWithinInterval(entryDate, { start, end });
      }
      
      return true;
    });
  };

  // Group entries by employee
  const groupedByEmployee = allEntries.reduce((acc, entry) => {
    if (!acc[entry.employeeName]) {
      acc[entry.employeeName] = [];
    }
    acc[entry.employeeName].push(entry);
    return acc;
  }, {} as Record<string, TimeEntry[]>);

  // Filter entries based on search and date filters
  const filteredEmployees = Object.entries(groupedByEmployee)
    .filter(([employeeName]) => 
      !selectedEmployee || employeeName === selectedEmployee
    )
    .filter(([employeeName]) =>
      employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(([employeeName, entries]) => ({
      employeeName,
      entries: filterEntriesByDate(entries).sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
    }));

  // Calculate total hours for each employee
  const calculateTotalHours = (entries: TimeEntry[]) => {
    return entries.reduce((total, entry) => total + entry.duration, 0);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Clock className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timesheet Management</h1>
          <p className="text-muted-foreground">Review and manage employee timesheets</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
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
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="John Admin">John Admin</SelectItem>
              <SelectItem value="Jane Employee">Jane Employee</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Date Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter Type</label>
                  <Select value={filterType} onValueChange={(value: 'current' | 'custom') => setFilterType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select filter type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filterType === 'custom' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={customDateRange.start}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                      />
                      <Input
                        type="date"
                        value={customDateRange.end}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-6">
        {filteredEmployees.map(({ employeeName, entries }) => {
          const isCollapsed = collapsedEmployees.includes(employeeName);
          const totalHours = calculateTotalHours(entries);

          return (
            <Card key={employeeName}>
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleEmployee(employeeName)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{employeeName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Total hours: {totalHours.toFixed(1)}h
                    </p>
                  </div>
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
              {!isCollapsed && (
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b">
                      <div>Date</div>
                      <div>Project</div>
                      <div className="col-span-2">Description</div>
                      <div>Duration</div>
                      <div>Actions</div>
                    </div>
                    <div className="divide-y">
                      {entries.map((entry) => (
                        <div key={entry.id} className="grid grid-cols-6 gap-4 p-4">
                          <div>{format(parseISO(entry.startTime), 'MMM d, yyyy')}</div>
                          <div>{entry.projectName}</div>
                          <div className="col-span-2">{entry.description}</div>
                          <div>{entry.duration.toFixed(2)}h</div>
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedEntry(entry)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                      {entries.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">
                          No timesheet entries found for this period
                        </div>
                      )}
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
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="font-medium">{selectedEntry.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-medium">{selectedEntry.projectName}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{selectedEntry.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="font-medium">
                    {format(parseISO(selectedEntry.startTime), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Time</p>
                  <p className="font-medium">
                    {format(parseISO(selectedEntry.endTime), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{selectedEntry.duration.toFixed(2)} hours</p>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleRejectEntry(selectedEntry)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveEntry(selectedEntry)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}