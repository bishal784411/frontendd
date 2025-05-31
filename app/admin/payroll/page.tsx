'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Download, Filter, Search, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subMonths } from 'date-fns';
import { toast } from 'sonner';

interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  month: string;
  year: string;
  basicSalary: number;
  allowances: {
    hra: number;
    transport: number;
    medical: number;
  };
  deductions: {
    tax: number;
    insurance: number;
    providentFund: number;
  };
  netPay: number;
  paymentDate: string;
  status: 'paid' | 'unpaid';
}

const mockEmployees = [
  { id: '1', name: 'John Admin', designation: 'HR Manager', department: 'Management', email: 'admin@example.com' },
  { id: '2', name: 'Jane Employee', designation: 'Software Engineer', department: 'Engineering', email: 'employee@example.com' },
];

// Generate demo salary records for the past 18 months
const generateDemoRecords = (): SalaryRecord[] => {
  const records: SalaryRecord[] = [];
  const now = new Date();

  for (let i = 0; i < 18; i++) {
    const date = subMonths(now, i);
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear().toString();

    // Generate records for both employees
    mockEmployees.forEach(employee => {
      // Base salary with small random variations
      const baseSalary = employee.id === '1' ? 8000 : 5000;
      const variation = Math.floor(Math.random() * 500);
      const basicSalary = baseSalary + variation;

      // Calculate allowances
      const hra = Math.floor(basicSalary * 0.2);
      const transport = 300;
      const medical = 200;

      // Calculate deductions
      const tax = Math.floor(basicSalary * 0.1);
      const insurance = 200;
      const providentFund = Math.floor(basicSalary * 0.06);

      // Calculate net pay
      const netPay = basicSalary + hra + transport + medical - tax - insurance - providentFund;

      records.push({
        id: `${employee.id}-${year}-${month}`,
        employeeId: employee.id,
        employeeName: employee.name,
        designation: employee.designation,
        month,
        year,
        basicSalary,
        allowances: {
          hra,
          transport,
          medical
        },
        deductions: {
          tax,
          insurance,
          providentFund
        },
        netPay,
        paymentDate: new Date(parseInt(year), date.getMonth(), 15).toISOString(),
        status: 'paid'
      });
    });
  }

  return records;
};

export default function PayrollPage() {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(generateDemoRecords());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [filterMonth, setFilterMonth] = useState('all-months');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [newSalary, setNewSalary] = useState({
    basicSalary: '',
    allowances: {
      hra: '',
      transport: '',
      medical: ''
    },
    deductions: {
      tax: '',
      insurance: '',
      providentFund: ''
    }
  });

  const calculateNetPay = () => {
    const basic = parseFloat(newSalary.basicSalary) || 0;
    const allowances = Object.values(newSalary.allowances).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const deductions = Object.values(newSalary.deductions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    return basic + allowances - deductions;
  };

  const sendSalaryEmail = (employee: typeof mockEmployees[0], amount: number) => {
    const subject = 'Salary Payment Notification';
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();
    const body = `Dear ${employee.name},\n\nYour salary for ${month} ${year} has been processed.\nAmount: $${amount}\n\nBest regards,\nHR Team`;
    
    // Open default email client
    window.location.href = `mailto:${employee.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = () => {
    if (!selectedEmployee || !newSalary.basicSalary) {
      toast.error('Please fill in all required fields');
      return;
    }

    const employee = mockEmployees.find(emp => emp.id === selectedEmployee);
    if (!employee) return;

    const netPay = calculateNetPay();

    try {
      const salaryRecord: SalaryRecord = {
        id: Date.now().toString(),
        employeeId: employee.id,
        employeeName: employee.name,
        designation: employee.designation,
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear().toString(),
        basicSalary: parseFloat(newSalary.basicSalary),
        allowances: {
          hra: parseFloat(newSalary.allowances.hra) || 0,
          transport: parseFloat(newSalary.allowances.transport) || 0,
          medical: parseFloat(newSalary.allowances.medical) || 0
        },
        deductions: {
          tax: parseFloat(newSalary.deductions.tax) || 0,
          insurance: parseFloat(newSalary.deductions.insurance) || 0,
          providentFund: parseFloat(newSalary.deductions.providentFund) || 0
        },
        netPay,
        paymentDate: new Date().toISOString(),
        status: 'paid'
      };

      setSalaryRecords([salaryRecord, ...salaryRecords]);
      setNewSalary({
        basicSalary: '',
        allowances: { hra: '', transport: '', medical: '' },
        deductions: { tax: '', insurance: '', providentFund: '' }
      });
      
      // Send email notification
      sendSalaryEmail(employee, netPay);
      toast.success('Salary processed and email client opened');
    } catch (error) {
      toast.error('Failed to process salary payment');
    }
  };

  const downloadSalarySlip = (record: SalaryRecord) => {
    // This would typically generate a PDF
    toast.success('Salary slip downloaded');
  };

  const filteredRecords = salaryRecords.filter(record => {
    const matchesMonth = filterMonth === 'all-months' || record.month === filterMonth;
    const matchesYear = !filterYear || record.year === filterYear;
    return matchesMonth && matchesYear;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <DollarSign className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">Manage employee salaries and payments</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              ${salaryRecords.reduce((sum, record) => sum + record.netPay, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total payments made</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{salaryRecords.length}</p>
            <p className="text-sm text-muted-foreground">Salary records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              ${salaryRecords.length ? 
                (salaryRecords.reduce((sum, record) => sum + record.netPay, 0) / salaryRecords.length).toLocaleString() 
                : '0'}
            </p>
            <p className="text-sm text-muted-foreground">Per employee</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Process Salary Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Employee</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEmployees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} - {emp.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Basic Salary</label>
                <Input
                  type="number"
                  placeholder="Enter basic salary"
                  value={newSalary.basicSalary}
                  onChange={(e) => setNewSalary({ ...newSalary, basicSalary: e.target.value })}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Allowances</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">HRA</label>
                  <Input
                    type="number"
                    placeholder="HRA amount"
                    value={newSalary.allowances.hra}
                    onChange={(e) => setNewSalary({
                      ...newSalary,
                      allowances: { ...newSalary.allowances, hra: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transport</label>
                  <Input
                    type="number"
                    placeholder="Transport allowance"
                    value={newSalary.allowances.transport}
                    onChange={(e) => setNewSalary({
                      ...newSalary,
                      allowances: { ...newSalary.allowances, transport: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medical</label>
                  <Input
                    type="number"
                    placeholder="Medical allowance"
                    value={newSalary.allowances.medical}
                    onChange={(e) => setNewSalary({
                      ...newSalary,
                      allowances: { ...newSalary.allowances, medical: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Deductions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax</label>
                  <Input
                    type="number"
                    placeholder="Tax amount"
                    value={newSalary.deductions.tax}
                    onChange={(e) => setNewSalary({
                      ...newSalary,
                      deductions: { ...newSalary.deductions, tax: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Insurance</label>
                  <Input
                    type="number"
                    placeholder="Insurance amount"
                    value={newSalary.deductions.insurance}
                    onChange={(e) => setNewSalary({
                      ...newSalary,
                      deductions: { ...newSalary.deductions, insurance: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provident Fund</label>
                  <Input
                    type="number"
                    placeholder="PF amount"
                    value={newSalary.deductions.providentFund}
                    onChange={(e) => setNewSalary({
                      ...newSalary,
                      deductions: { ...newSalary.deductions, providentFund: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium">Net Pay</p>
                <p className="text-2xl font-bold">${calculateNetPay().toLocaleString()}</p>
              </div>
              <Button onClick={handleSubmit}>Process Payment</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Salary Records</CardTitle>
            <div className="flex gap-4">
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-months">All Months</SelectItem>
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by year" />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2023, 2022].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-7 gap-4 p-4 font-medium border-b">
              <div>Employee</div>
              <div>Designation</div>
              <div>Month</div>
              <div>Basic Salary</div>
              <div>Net Pay</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            <div className="divide-y">
              {filteredRecords.map((record) => (
                <div key={record.id} className="grid grid-cols-7 gap-4 p-4">
                  <div>{record.employeeName}</div>
                  <div>{record.designation}</div>
                  <div>{record.month} {record.year}</div>
                  <div>${record.basicSalary.toLocaleString()}</div>
                  <div>${record.netPay.toLocaleString()}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadSalarySlip(record)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredRecords.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  No salary records found
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}