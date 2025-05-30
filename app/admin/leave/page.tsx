'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLeaveStore } from '@/lib/leave-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Search, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminLeavePage() {
  const { user } = useAuth();
  const { getAllLeaveRequests, updateLeaveRequest, updateLeaveBalance, calculateLeaveBalance } = useLeaveStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock employees - in a real app, this would come from your user store
  const employees = [
    { id: '1', name: 'John Admin', employmentType: 'full-time' },
    { id: '2', name: 'Jane Employee', employmentType: 'full-time' },
  ];

  const leaveRequests = getAllLeaveRequests().sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const filteredRequests = leaveRequests.filter(request =>
    request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    const request = leaveRequests.find(r => r.id === id);
    if (!request) return;

    updateLeaveRequest(id, status, user?.name || '');
    
    if (status === 'approved') {
      updateLeaveBalance(request.userId, request.type, request.hours);
    }
    
    toast.success(`Leave request ${status}`);
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

  const pendingRequests = leaveRequests.filter(r => r.status === 'pending').length;
  const approvedRequests = leaveRequests.filter(r => r.status === 'approved').length;
  const rejectedRequests = leaveRequests.filter(r => r.status === 'rejected').length;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Calendar className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">Review and manage leave requests</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{pendingRequests}</p>
            <p className="text-sm text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approved Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{approvedRequests}</p>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rejected Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{rejectedRequests}</p>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="mt-8">
        <TabsList>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Leave Requests
          </TabsTrigger>
          <TabsTrigger value="balances" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Leave Balances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Leave Requests</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{request.employeeName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Leave Type</p>
                      <p className="font-medium capitalize">{request.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{request.hours}h</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">{format(new Date(request.startDate), 'PP')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">{format(new Date(request.endDate), 'PP')}</p>
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="mt-4 flex justify-end gap-4">
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateStatus(request.id, 'rejected')}
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(request.id, 'approved')}
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                  {request.reviewedAt && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      Reviewed by {request.reviewedBy} on {format(new Date(request.reviewedAt), 'PPp')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {filteredRequests.length === 0 && (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  No leave requests found
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="balances">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Employee Leave Balances</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {employees.filter(emp => emp.employmentType === 'full-time').map((employee) => {
                const balance = calculateLeaveBalance(employee.id);
                return (
                  <Card key={employee.id}>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4">{employee.name}</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Annual Leave</span>
                          <span className="font-medium">{balance.annual}h</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Personal Leave</span>
                          <span className="font-medium">{balance.personal}h</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full mt-2">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{
                              width: `${Math.min(100, (balance.annual / (balance.annual + balance.personal)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}