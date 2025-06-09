'use client';

import React from 'react';
// import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLeaveStore } from '@/lib/leave-store';
import { useTimeSheetStore } from '@/lib/timesheet-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, CheckCircle2, AlertCircle, Calendar as CalendarIcon, BarChart2, LineChart, Plus } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, addDays, parseISO, differenceInMinutes, isAfter, subMonths } from 'date-fns';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TimeEntry } from '@/lib/types';


// Import events from calendar page's demo data
const calendarEvents = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Weekly team sync',
    date: new Date(2025, 4, 6),
    startTime: { time: '10:00', period: 'AM' },
    endTime: { time: '11:00', period: 'AM' },
    meetingLink: 'https://zoom.us/j/123456789',
    createdBy: 'John Admin',
    status: 'approved',
    creatorRole: 'admin'
  },
  {
    id: '2',
    title: 'Project Review',
    description: 'Monthly project status review',
    date: new Date(2025, 4, 10),
    startTime: { time: '02:00', period: 'PM' },
    endTime: { time: '03:30', period: 'PM' },
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    createdBy: 'John Admin',
    status: 'approved',
    creatorRole: 'admin'
  },
  {
    id: '3',
    title: 'Training Session',
    description: 'New tools introduction',
    date: new Date(2025, 4, 19),
    startTime: { time: '11:00', period: 'AM' },
    endTime: { time: '12:30', period: 'PM' },
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/123',
    createdBy: 'Jane Employee',
    status: 'pending',
    creatorRole: 'employee'
  }
];


export default function Dashboard() {
  const { user } = useAuth();
  const { getEntriesForUser, getAllEntries, addTimeEntry } = useTimeSheetStore();
  const { calculateLeaveBalance } = useLeaveStore();
  const [newEntry, setNewEntry] = useState({
    startTime: '',
    endTime: '',
    description: '',
    projectName: '',
  });
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const leaveBalance = user ? calculateLeaveBalance(user.id) : { annual: 0, personal: 0 };


  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    const today = new Date();
    const [startHours, startMinutes] = newEntry.startTime.split(':');
    const [endHours, endMinutes] = newEntry.endTime.split(':');
    
    const startTime = new Date(today);
    startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
    
    const endTime = new Date(today);
    endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    if (endTime <= startTime) {
      toast.error('End time must be after start time');
      return;
    }

    const duration = differenceInMinutes(endTime, startTime) / 60;
    
    const entry: TimeEntry = {
      id: Date.now().toString(),
      userId: user?.id || '',
      employeeName: user?.name || '',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      description: newEntry.description,
      projectName: newEntry.projectName,
      duration
    };

    addTimeEntry(entry);
    setNewEntry({
      startTime: '',
      endTime: '',
      description: '',
      projectName: '',
    });
    setShowManualEntry(false);
    toast.success('Time entry added successfully');
  };

  const getFilteredTimeData = () => {
    const today = new Date();
    // let startDate, endDate;
    let startDate: Date , endDate: Date;


    switch (timeFilter) {
      case 'week':
        startDate = startOfWeek(today);
        endDate = endOfWeek(today);
        break;
      case 'month':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
    }

    // let entries = user?.role?.name === 'Admin' ? getAllEntries() : getEntriesForUser(user?.id || '');
    let entries = user?.role?.name === 'Admin' ? getAllEntries() : getEntriesForUser(user?.id || '');


    if (user?.role?.name === 'Admin' && selectedEmployee !== 'all') {
      entries = entries.filter(entry => entry.employeeName === selectedEmployee);
    }

    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return isWithinInterval(entryDate, { start: startDate, end: endDate });
    });

    const groupedData = filteredEntries.reduce((acc, entry) => {
      const date = format(new Date(entry.startTime), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, hours: 0 };
      }
      acc[date].hours += entry.duration;
      return acc;
    }, {} as Record<string, { date: string; hours: number }>);

    return Object.values(groupedData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const renderChart = () => {
    const data = getFilteredTimeData();
    const ChartComponent = chartType === 'bar' ? BarChart : RechartsLineChart;
    // const DataComponent = chartType === 'bar' ? Bar : Line;
    const DataComponent = (chartType === 'bar' ? Bar : Line) as React.ElementType;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => format(new Date(value), 'MMM d')}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
            formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Hours Worked']}
          />
          <DataComponent 
            dataKey="hours" 
            fill="hsl(var(--primary))"
            stroke="hsl(var(--primary))"
            radius={chartType === 'bar' ? [4, 4, 0, 0] : undefined}
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  // Calculate total hours worked
  const calculateTotalHours = () => {
    const entries = user?.role?.name === 'Admin' ? getAllEntries() : getEntriesForUser(user?.id || '');
    return entries.reduce((total, entry) => total + entry.duration, 0);
  };

  const currentMonth = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());
  const timeEntries = getEntriesForUser(user?.id || '');
  
  const currentMonthEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return isWithinInterval(entryDate, { start: currentMonth, end: currentMonthEnd });
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{calculateTotalHours().toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">Total Hours Worked</p>
              </div>
              {currentMonthEntries.length === 0 && user?.role?.name === 'Employee' && (
                <div className="text-center py-4">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">No time entries for this month</p>
                  <Button onClick={() => setShowManualEntry(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Time Entry
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {user?.role?.name === 'Employee' && (
          <Card>
            <CardHeader>
              <CardTitle>Leave Balance</CardTitle>
              <CardDescription>Available leave hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Annual Leave</span>
                  <span className="text-2xl font-bold">{leaveBalance.annual}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Personal Leave</span>
                  <span className="text-2xl font-bold">{leaveBalance.personal}h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showManualEntry && (
        <Card>
          <CardHeader>
            <CardTitle>Add Time Entry</CardTitle>
            <CardDescription>
              Current date: {format(new Date(), 'MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="time"
                    required
                    value={newEntry.startTime}
                    onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="time"
                    required
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  type="text"
                  placeholder="Enter project name"
                  required
                  value={newEntry.projectName}
                  onChange={(e) => setNewEntry({ ...newEntry, projectName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  type="text"
                  placeholder="What did you work on?"
                  required
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setShowManualEntry(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Entry</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Working Hours
          </CardTitle>
          <div className="flex items-center gap-4">
            {user?.role?.name === 'Admin' && (
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="John Admin">John Admin</SelectItem>
                  <SelectItem value="Jane Employee">Jane Employee</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={timeFilter} onValueChange={(value: 'week' | 'month') => setTimeFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <ToggleGroup type="single" value={chartType} onValueChange={(value: 'bar' | 'line') => value && setChartType(value)}>
              <ToggleGroupItem value="bar" aria-label="Bar Chart">
                <BarChart2 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="line" aria-label="Line Chart">
                <LineChart className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {renderChart()}
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calendarEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(event.date, 'PPP')}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{event.startTime.time} {event.startTime.period}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/calendar">View Details</a>
                </Button>
              </div>
            ))}
            {calendarEvents.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No upcoming events
              </p>
            )}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}