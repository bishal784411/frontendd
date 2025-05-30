import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LeaveRequest, LeaveBalance } from './types';
import { useTimeSheetStore } from './timesheet-store';
import { useNotificationStore } from './notification-store';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

interface LeaveStore {
  leaveRequests: LeaveRequest[];
  leaveBalances: LeaveBalance[];
  addLeaveRequest: (request: LeaveRequest) => void;
  updateLeaveRequest: (id: string, status: 'approved' | 'rejected', reviewedBy: string) => void;
  getLeaveRequestsForUser: (userId: string) => LeaveRequest[];
  getAllLeaveRequests: () => LeaveRequest[];
  calculateLeaveBalance: (userId: string) => LeaveBalance;
  updateLeaveBalance: (userId: string, type: 'annual' | 'personal', hours: number) => void;
}

export const useLeaveStore = create<LeaveStore>()(
  persist(
    (set, get) => ({
      leaveRequests: [],
      leaveBalances: [],
      
      addLeaveRequest: (request) => {
        const { addNotification } = useNotificationStore.getState();
        set((state) => ({
          leaveRequests: [...state.leaveRequests, request]
        }));
        
        // Only notify admin about new leave request
        addNotification({
          type: 'leave_request',
          employeeName: request.employeeName,
          message: `${request.employeeName} submitted a leave request`
        });
      },
      
      updateLeaveRequest: (id, status, reviewedBy) => {
        const { addNotification } = useNotificationStore.getState();
        const request = get().leaveRequests.find(r => r.id === id);
        
        set((state) => ({
          leaveRequests: state.leaveRequests.map(request =>
            request.id === id
              ? {
                  ...request,
                  status,
                  reviewedAt: new Date().toISOString(),
                  reviewedBy
                }
              : request
          )
        }));

        // Add notification only for the employee who submitted the request
        if (request) {
          addNotification({
            type: 'leave_request',
            employeeName: reviewedBy,
            message: `Your leave request has been ${status}`,
            targetUserId: request.userId
          });
        }
      },
      
      getLeaveRequestsForUser: (userId) =>
        get().leaveRequests.filter(request => request.userId === userId),
      
      getAllLeaveRequests: () => get().leaveRequests,
      
      calculateLeaveBalance: (userId) => {
        const timeEntries = useTimeSheetStore.getState().getEntriesForUser(userId);
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        // Calculate total hours for current month
        const totalMonthHours = timeEntries.reduce((sum, entry) => {
          const entryDate = new Date(entry.startTime);
          if (isWithinInterval(entryDate, { start: monthStart, end: monthEnd })) {
            return sum + entry.duration;
          }
          return sum;
        }, 0);

        // Calculate leave balances based on total hours worked
        const annualLeaveHours = Math.floor(totalMonthHours * 0.10); // 10% of monthly hours
        const personalLeaveHours = Math.floor(totalMonthHours * 0.05); // 5% of monthly hours

        // Calculate used leave hours for the current month
        const usedLeave = get().leaveRequests
          .filter(request => 
            request.userId === userId && 
            request.status === 'approved' &&
            isWithinInterval(new Date(request.startDate), { start: monthStart, end: monthEnd })
          )
          .reduce((acc, request) => ({
            annual: acc.annual + (request.type === 'annual' ? request.hours : 0),
            personal: acc.personal + (request.type === 'personal' ? request.hours : 0)
          }), { annual: 0, personal: 0 });

        return {
          userId,
          annual: Math.max(0, annualLeaveHours - usedLeave.annual),
          personal: Math.max(0, personalLeaveHours - usedLeave.personal)
        };
      },
      
      updateLeaveBalance: (userId, type, hours) => {
        const balance = get().calculateLeaveBalance(userId);
        if (type === 'annual') {
          balance.annual -= hours;
        } else {
          balance.personal -= hours;
        }
        set((state) => ({
          leaveBalances: [
            ...state.leaveBalances.filter(b => b.userId !== userId),
            balance
          ]
        }));
      }
    }),
    {
      name: 'leave-storage',
    }
  )
);