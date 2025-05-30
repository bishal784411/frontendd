"use client";

import { useState } from "react";
import { useAuth } from '@/lib/auth-context';
import { useNotificationStore } from '@/lib/notification-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths, subWeeks } from 'date-fns';
import { toast } from 'sonner';
import { Textarea } from "@/components/ui/textarea";

interface WeeklyReport {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  department: string;
  issuesEncountered: string;
  objectivesCompleted: string;
  supportNeeded: string;
  nextWeekPlans: string;
}

const departments = ['All Departments', 'Web Development', 'Data Analysis', 'Public Impact'];
const employees = [
  { id: '1', name: 'John Admin', department: 'Web Development' },
  { id: '2', name: 'Jane Employee', department: 'Data Analysis' },
  { id: '3', name: 'Mike Johnson', department: 'Public Impact' },
];

const demoReports: WeeklyReport[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    employeeId: '1',
    employeeName: 'John Admin',
    department: 'Web Development',
    issuesEncountered: 'Some API integration delays due to third-party service downtime.',
    objectivesCompleted: 'Completed user authentication system and dashboard analytics implementation. Successfully deployed new features to production.',
    supportNeeded: 'Need additional QA resources for thorough testing.',
    nextWeekPlans: 'Start implementing the reporting module and fix remaining bugs. Plan to optimize database queries.'
  },
  {
    id: '2',
    date: subWeeks(new Date(), 1).toISOString(),
    employeeId: '1',
    employeeName: 'John Admin',
    department: 'Web Development',
    issuesEncountered: 'Performance issues in production environment.',
    objectivesCompleted: 'Optimized database queries and implemented caching layer. Reduced API response time by 40%.',
    supportNeeded: '',
    nextWeekPlans: 'Implement real-time notifications and improve error handling.'
  },
  {
    id: '3',
    date: new Date().toISOString(),
    employeeId: '2',
    employeeName: 'Jane Employee',
    department: 'Data Analysis',
    issuesEncountered: 'Data inconsistencies in legacy system export.',
    objectivesCompleted: 'Successfully migrated historical data and created new analysis models. Implemented automated data validation checks.',
    supportNeeded: 'Additional storage capacity for data warehouse.',
    nextWeekPlans: 'Begin implementing real-time analytics dashboard and set up monitoring alerts.'
  },
  {
    id: '4',
    date: subMonths(new Date(), 1).toISOString(),
    employeeId: '2',
    employeeName: 'Jane Employee',
    department: 'Data Analysis',
    issuesEncountered: 'Integration issues with third-party analytics tools.',
    objectivesCompleted: 'Set up new data pipeline and implemented automated reporting system.',
    supportNeeded: 'Need access to advanced analytics tools.',
    nextWeekPlans: 'Create custom dashboards for different departments.'
  },
  {
    id: '5',
    date: new Date().toISOString(),
    employeeId: '3',
    employeeName: 'Mike Johnson',
    department: 'Public Impact',
    issuesEncountered: '',
    objectivesCompleted: 'Launched community outreach program and completed stakeholder interviews. Organized successful virtual town hall meeting.',
    supportNeeded: '',
    nextWeekPlans: 'Prepare presentation for quarterly review and start new initiative planning.'
  },
  {
    id: '6',
    date: subWeeks(new Date(), 2).toISOString(),
    employeeId: '3',
    employeeName: 'Mike Johnson',
    department: 'Public Impact',
    issuesEncountered: 'Schedule conflicts with key stakeholders.',
    objectivesCompleted: 'Completed impact assessment report and presented findings to board.',
    supportNeeded: 'Additional budget for community events.',
    nextWeekPlans: 'Develop new engagement strategies and plan upcoming events.'
  },
  {
    id: '7',
    date: subMonths(new Date(), 2).toISOString(),
    employeeId: '1',
    employeeName: 'John Admin',
    department: 'Web Development',
    issuesEncountered: 'Technical debt in legacy codebase.',
    objectivesCompleted: 'Completed major refactoring sprint and updated documentation.',
    supportNeeded: 'Need additional development resources.',
    nextWeekPlans: 'Start implementing new feature requests and continue code optimization.'
  },
  {
    id: '8',
    date: subWeeks(new Date(), 3).toISOString(),
    employeeId: '2',
    employeeName: 'Jane Employee',
    department: 'Data Analysis',
    issuesEncountered: 'Data quality issues in source systems.',
    objectivesCompleted: 'Implemented data quality checks and created comprehensive data dictionary.',
    supportNeeded: 'Need specialized training for new tools.',
    nextWeekPlans: 'Begin machine learning model development and data visualization improvements.'
  }
];

export default function ReportsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotificationStore();
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>(demoReports);
  const [newReport, setNewReport] = useState({
    issuesEncountered: '',
    objectivesCompleted: '',
    supportNeeded: '',
    nextWeekPlans: '',
  });

  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });

  const handleSubmitReport = () => {
    if (!newReport.objectivesCompleted || !newReport.nextWeekPlans) {
      toast.error('Please fill in at least the completed objectives and next week plans');
      return;
    }

    const report: WeeklyReport = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      employeeId: user?.id || '',
      employeeName: user?.name || '',
      department: user?.department || '',
      ...newReport
    };

    setWeeklyReports([report, ...weeklyReports]);
    setNewReport({
      issuesEncountered: '',
      objectivesCompleted: '',
      supportNeeded: '',
      nextWeekPlans: '',
    });

    addNotification({
      type: 'weekly_report',
      employeeName: user?.name || '',
      message: `${user?.name} submitted a weekly report`
    });

    toast.success('Weekly report submitted successfully');
  };

  const filteredReports = weeklyReports.filter(report => {
    if (user?.role === 'employee' && report.employeeId !== user.id) {
      return false;
    }

    const matchesDepartment = selectedDepartment === 'All Departments' || report.department === selectedDepartment;
    const matchesEmployee = selectedEmployee === 'all' || report.employeeId === selectedEmployee;
    
    let matchesDate = true;
    const reportDate = parseISO(report.date);

    if (dateFilter === 'month') {
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      matchesDate = isWithinInterval(reportDate, { start: monthStart, end: monthEnd });
    } else if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
      const start = parseISO(customDateRange.start);
      const end = parseISO(customDateRange.end);
      matchesDate = isWithinInterval(reportDate, { start, end });
    }

    return matchesDepartment && matchesEmployee && matchesDate;
  });

  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 mb-6">
      <Select value={dateFilter} onValueChange={setDateFilter}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {dateFilter === 'custom' && (
        <div className="flex gap-2">
          <input
            type="date"
            className="rounded-md border px-3 py-2"
            value={customDateRange.start}
            onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
          <input
            type="date"
            className="rounded-md border px-3 py-2"
            value={customDateRange.end}
            onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
        </div>
      )}

      {user?.role === 'admin' && (
        <>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );

  const renderReportForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Submit Weekly Report</CardTitle>
        <CardDescription>Share your progress and plans for the week</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Objectives Completed</label>
          <Textarea
            placeholder="List your key accomplishments this week..."
            value={newReport.objectivesCompleted}
            onChange={(e) => setNewReport({ ...newReport, objectivesCompleted: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Issues Encountered</label>
          <Textarea
            placeholder="Describe any challenges or blockers you faced..."
            value={newReport.issuesEncountered}
            onChange={(e) => setNewReport({ ...newReport, issuesEncountered: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Support Needed</label>
          <Textarea
            placeholder="What assistance or resources do you need?"
            value={newReport.supportNeeded}
            onChange={(e) => setNewReport({ ...newReport, supportNeeded: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Plans for Next Week</label>
          <Textarea
            placeholder="Outline your goals and priorities for next week..."
            value={newReport.nextWeekPlans}
            onChange={(e) => setNewReport({ ...newReport, nextWeekPlans: e.target.value })}
          />
        </div>
        <Button onClick={handleSubmitReport} className="w-full">
          Submit Report
        </Button>
      </CardContent>
    </Card>
  );

  const renderReportList = () => (
    <div className="space-y-6">
      {filteredReports.map((report) => (
        <Card key={report.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{report.employeeName}</CardTitle>
                <CardDescription>{report.department}</CardDescription>
              </div>
              <span className="text-sm text-muted-foreground">
                {format(parseISO(report.date), 'PPP')}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Completed Objectives</h4>
              <p className="text-sm text-muted-foreground">{report.objectivesCompleted}</p>
            </div>
            {report.issuesEncountered && (
              <div>
                <h4 className="font-medium mb-2">Issues Encountered</h4>
                <p className="text-sm text-muted-foreground">{report.issuesEncountered}</p>
              </div>
            )}
            {report.supportNeeded && (
              <div>
                <h4 className="font-medium mb-2">Support Needed</h4>
                <p className="text-sm text-muted-foreground">{report.supportNeeded}</p>
              </div>
            )}
            <div>
              <h4 className="font-medium mb-2">Next Week Plans</h4>
              <p className="text-sm text-muted-foreground">{report.nextWeekPlans}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No reports found matching the selected filters
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {user?.role === 'admin' ? 'Reports & Analytics' : 'Weekly Reports'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {user?.role === 'admin' 
                ? 'View and manage employee reports' 
                : 'Submit and track your weekly progress reports'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {user?.role === 'employee' && renderReportForm()}
        {renderFilters()}
        {renderReportList()}
      </div>
    </div>
  );
}