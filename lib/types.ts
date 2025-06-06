export interface Role {
  id: number;
  name: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleId?: number; 
  department?: string;
  position?: string;
  avatar?: string | null;
  joinDate?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  idType?: 'passport' | 'citizenship' | 'driving-license';
  frontImage?: string | null;
  panCardImage?: string | null;
  employmentType: 'full-time' | 'part-time';
  password?: string;
  document?: string;           // New: document field
  fullTimer?: boolean;         // New: fullTimer field
  salary?: number;             // New: salary field
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    bankAddress: string;
    accountHolderName: string;
    panId: string;
  };
}

export interface TimeEntry {
  id: string;
  userId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  description: string;
  projectName: string;
  duration: number;
  verified?: boolean; // Now optional
}

export interface WeeklyReport {
  id: string;
  userId: string;
  weekEnding: string;
  tasksCompleted: string[];
  challenges: string[];
  upcomingGoals: string[];
  submittedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'on-hold';
  assignedEmployees: string[];
  department: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId: string;
}

export interface Employee extends User {
  department: string;
  position: string;
  joinDate: string;
  reportsTo?: string;
  status: 'active' | 'inactive';
}

export interface LeaveRequest {
  id: string;
  userId: string;
  employeeName: string;
  type: 'annual' | 'personal';
  startDate: string;
  endDate: string;
  hours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface LeaveBalance {
  userId: string;
  annual: number;
  personal: number;
}

export interface Notification {
  id: string;
  type: 'leave_request' | 'weekly_report' | 'ticket';
  employeeName: string;
  timestamp: string;
  read: boolean;
  message?: string;
  targetUserId?: string;
}

export interface Ticket {
  id: string;
  userId: string;
  employeeName: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: 'technical' | 'hr' | 'administrative' | 'other';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: string;
}