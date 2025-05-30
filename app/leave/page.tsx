'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLeaveStore } from '@/lib/leave-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { LeaveRequest } from '@/lib/types';

export default function LeavePage() {
  const { user } = useAuth();
  const { addLeaveRequest, getLeaveRequestsForUser, calculateLeaveBalance } = useLeaveStore();
  const [newLeave, setNewLeave] = useState({
    type: 'annual',
    startDate: '',
    endDate: '',
    hours: 0,
    reason: '',
  });

  const leaveBalance = calculateLeaveBalance(user?.id || '');
  const leaveRequests = getLeaveRequestsForUser(user?.id || '');

  const handleSubmitLeave = () => {
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.hours || !newLeave.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    const availableHours = newLeave.type === 'annual' ? leaveBalance.annual : leaveBalance.personal;
    if (newLeave.hours > availableHours) {
      toast.error(`Insufficient ${newLeave.type} leave balance`);
      return;
    }

    const request: LeaveRequest = {
      id: Date.now().toString(),
      userId: user?.id || '',
      employeeName: user?.name || '',
      type: newLeave.type as 'annual' | 'personal',
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      hours: newLeave.hours,
      reason: newLeave.reason,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    addLeaveRequest(request);
    setNewLeave({
      type: 'annual',
      startDate: '',
      endDate: '',
      hours: 0,
      reason: '',
    });
    toast.success('Leave request submitted successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Calendar className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">Request and track your leave</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Annual Leave Balance</CardTitle>
            <CardDescription>10% of total hours worked</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{leaveBalance.annual}h</p>
            <p className="text-sm text-muted-foreground">Available hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Leave Balance</CardTitle>
            <CardDescription>5% of total hours worked</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{leaveBalance.personal}h</p>
            <p className="text-sm text-muted-foreground">Available hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Leave Requests</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Request Leave</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Leave Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Leave Type</label>
                <Select
                  value={newLeave.type}
                  onValueChange={(value) => setNewLeave({ ...newLeave, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hours Requested</label>
                <Input
                  type="number"
                  min="1"
                  value={newLeave.hours}
                  onChange={(e) => setNewLeave({ ...newLeave, hours: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason</label>
                <Input
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  placeholder="Enter reason for leave"
                />
              </div>
              <Button className="w-full" onClick={handleSubmitLeave}>
                Submit Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6">
        {leaveRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No leave requests found
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {leaveRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold capitalize">{request.type} Leave</h3>
                      <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">{format(new Date(request.startDate), 'PPP')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">{format(new Date(request.endDate), 'PPP')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hours Requested</p>
                      <p className="font-medium">{request.hours}h</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="font-medium">{format(new Date(request.submittedAt), 'PPP')}</p>
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