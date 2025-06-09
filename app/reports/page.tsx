'use client';

import { useEffect, useState } from "react";
import { useAuth } from '@/lib/auth-context';
import { useNotificationStore } from '@/lib/notification-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search } from "lucide-react";
import dynamic from 'next/dynamic';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths, subWeeks } from 'date-fns';
import { toast } from 'sonner';

// Dynamic import of React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface WeeklyReport {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  department: string;
  submittedTo: string;
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
  { id: '4', name: 'Bishal Timsina', department: 'Web Development' },
];

const reportRecipients = [
  'Austin Koacher',
  'Riwaj Chalise',
  'Adam Sawyer'
];

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['clean']
  ]
};

const quillFormats = [
  'bold', 'italic', 'underline',
  'list', 'bullet'
];

const demoReports: WeeklyReport[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    employeeId: '1',
    employeeName: 'John Admin',
    department: 'Web Development',
    submittedTo: 'Austin Koacher',
    issuesEncountered: 'Some API integration delays due to third-party service downtime.',
    objectivesCompleted: '<ul><li>Completed user authentication system</li><li>Implemented dashboard analytics</li><li>Successfully deployed new features to production</li></ul>',
    supportNeeded: 'Need additional QA resources for thorough testing.',
    nextWeekPlans: '<ul><li>Start implementing the reporting module</li><li>Fix remaining bugs</li><li>Optimize database queries</li></ul>'
  },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotificationStore();
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>(demoReports);
  const [newReport, setNewReport] = useState({
    submittedTo: '',
    issuesEncountered: '',
    objectivesCompleted: '',
    supportNeeded: '',
    nextWeekPlans: '',
  });

  useEffect(() => {
    if (!user) return;

    console.log('User loaded:', user);

    if (user?.role?.name === 'Admin') {
      const demo: WeeklyReport = {
        id: 'demo-1',
        date: new Date().toISOString().split('T')[0],
        employeeId: 'emp-123',
        employeeName: 'Bishal Timsina',
        department: 'Web Development',
        submittedTo: 'Riwaj Chalise',
        issuesEncountered: '<p>Encountered deployment delay due to staging server downtime.</p>',
        objectivesCompleted: '<ul><li>Refactored component architecture</li><li>Improved API response times</li></ul>',
        supportNeeded: '<p>Need feedback on UI mockups from UX team.</p>',
        nextWeekPlans: '<ul><li>Start testing phase</li><li>Conduct peer reviews</li></ul>',
      };

      setNewReport(demo);
      setWeeklyReports((prev) => [demo, ...prev]);
    }
  }, [user]);
  useEffect(() => {
    if (user?.role?.name === 'Employee') {
      const demo = {
        submittedTo: 'Austin Koacher',
        issuesEncountered: '<p>Encountered deployment delay due to staging server downtime.</p>',
        objectivesCompleted: '<ul><li>Refactored component architecture</li><li>Improved API response times</li></ul>',
        supportNeeded: '<p>Need feedback on UI mockups from UX team.</p>',
        nextWeekPlans: '<ul><li>Start testing phase</li><li>Conduct peer reviews</li></ul>',
      };

      setNewReport(demo);               // ✅ Fill the form
      // setWeeklyReports([demo]);         // ✅ Show it in the table/list
    }
  }, [user?.role?.name]);

  




  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedRecipient, setSelectedRecipient] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });

  const handleSubmitReport = () => {
    if (!newReport.objectivesCompleted || !newReport.nextWeekPlans || !newReport.submittedTo) {
      toast.error('Please fill in all required fields and select a recipient');
      return;
    }

    const report: WeeklyReport = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      employeeId: user?.id || '',
      employeeName: user?.name || '',
      department: user?.department || '',
      submittedTo: newReport.submittedTo,
      issuesEncountered: newReport.issuesEncountered,
      objectivesCompleted: newReport.objectivesCompleted,
      supportNeeded: newReport.supportNeeded,
      nextWeekPlans: newReport.nextWeekPlans,
    };

    setWeeklyReports([report, ...weeklyReports]);
    setNewReport({
      submittedTo: '',
      issuesEncountered: '',
      objectivesCompleted: '',
      supportNeeded: '',
      nextWeekPlans: '',
    });

    addNotification({
      type: 'weekly_report',
      employeeName: user?.name || '',
      message: `${user?.name} submitted a weekly report to ${report.submittedTo}`
    });

    toast.success('Weekly report submitted successfully');
  };

  const filteredReports = weeklyReports.filter(report => {
    if (user?.role?.name === 'Employee' && report.employeeId !== user.id) {
      return false;
    }

    const matchesDepartment = selectedDepartment === 'All Departments' || report.department === selectedDepartment;
    const matchesEmployee = selectedEmployee === 'all' || report.employeeId === selectedEmployee;
    const matchesRecipient = selectedRecipient === 'all' || report.submittedTo === selectedRecipient;
    const matchesSearch = report.employeeName.toLowerCase().includes(searchTerm.toLowerCase());

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

    return matchesDepartment && matchesEmployee && matchesRecipient && matchesSearch && matchesDate;
  });

  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 mb-6">
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
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by department" />
        </SelectTrigger>
        <SelectContent>
          {departments.map(dept => (
            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
          ))}
        </SelectContent>
      </Select>

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
          <Input
            type="date"
            className="w-[200px]"
            value={customDateRange.start}
            onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
          <Input
            type="date"
            className="w-[200px]"
            value={customDateRange.end}
            onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
        </div>
      )}

      <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by recipient" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Recipients</SelectItem>
          {reportRecipients.map(recipient => (
            <SelectItem key={recipient} value={recipient}>{recipient}</SelectItem>
          ))}
        </SelectContent>
      </Select>
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
          <label className="text-sm font-medium">Submit Report To</label>
          <Select
            value={newReport.submittedTo}
            onValueChange={(value) => setNewReport({ ...newReport, submittedTo: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select recipient" />
            </SelectTrigger>
            <SelectContent>
              {reportRecipients.map(recipient => (
                <SelectItem key={recipient} value={recipient}>{recipient}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Objectives Completed</label>
          <div className="prose max-w-none">
            <ReactQuill
              value={newReport.objectivesCompleted}
              onChange={(value) => setNewReport({ ...newReport, objectivesCompleted: value })}
              modules={quillModules}
              formats={quillFormats}
              placeholder="List your key accomplishments this week..."
              className="bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Issues Encountered</label>
          <div className="prose max-w-none">
            <ReactQuill
              value={newReport.issuesEncountered}
              onChange={(value) => setNewReport({ ...newReport, issuesEncountered: value })}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Describe any challenges or blockers you faced..."
              className="bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Support Needed</label>
          <div className="prose max-w-none">
            <ReactQuill
              value={newReport.supportNeeded}
              onChange={(value) => setNewReport({ ...newReport, supportNeeded: value })}
              modules={quillModules}
              formats={quillFormats}
              placeholder="What assistance or resources do you need?"
              className="bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Plans for Next Week</label>
          <div className="prose max-w-none">
            <ReactQuill
              value={newReport.nextWeekPlans}
              onChange={(value) => setNewReport({ ...newReport, nextWeekPlans: value })}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Outline your goals and priorities for next week..."
              className="bg-white"
            />
          </div>
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
              <div className="text-right">
                <span className="text-sm text-muted-foreground">
                  {format(parseISO(report.date), 'PPP')}
                </span>
                <p className="text-sm font-medium mt-1">
                  Submitted to: {report.submittedTo}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Completed Objectives</h4>
              <div
                className="text-sm text-muted-foreground prose max-w-none"
                dangerouslySetInnerHTML={{ __html: report.objectivesCompleted }}
              />
            </div>

            {report.issuesEncountered && (
              <div>
                <h4 className="font-medium mb-2">Issues Encountered</h4>
                <div
                  className="text-sm text-muted-foreground prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: report.issuesEncountered }}
                />
              </div>
            )}

            {report.supportNeeded && (
              <div>
                <h4 className="font-medium mb-2">Support Needed</h4>
                <div
                  className="text-sm text-muted-foreground prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: report.supportNeeded }}
                />
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Next Week Plans</h4>
              <div
                className="text-sm text-muted-foreground prose max-w-none"
                dangerouslySetInnerHTML={{ __html: report.nextWeekPlans }}
              />
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
              {user?.role?.name === 'Admin' ? 'Reports & Analytics' : 'Weekly Reports'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {user?.role?.name === 'Admin'
                ? 'View and manage employee reports'
                : 'Submit and track your weekly progress reports'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {user?.role?.name === 'Employee' && renderReportForm()}
        {renderFilters()}
        {renderReportList()}
      </div>
    </div>
  );
}