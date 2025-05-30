'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Download, FileText } from "lucide-react";
import { format } from 'date-fns';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SalarySlip {
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
}

// Mock salary data
const mockSalarySlips: SalarySlip[] = [
  {
    id: '1',
    employeeId: '2',
    employeeName: 'Jane Employee',
    designation: 'Software Engineer',
    month: 'March',
    year: '2024',
    basicSalary: 5000,
    allowances: {
      hra: 1000,
      transport: 300,
      medical: 200
    },
    deductions: {
      tax: 500,
      insurance: 200,
      providentFund: 300
    },
    netPay: 5500,
    paymentDate: '2024-03-15T10:00:00Z'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Jane Employee',
    designation: 'Software Engineer',
    month: 'February',
    year: '2024',
    basicSalary: 5000,
    allowances: {
      hra: 1000,
      transport: 300,
      medical: 200
    },
    deductions: {
      tax: 500,
      insurance: 200,
      providentFund: 300
    },
    netPay: 5500,
    paymentDate: '2024-02-15T10:00:00Z'
  }
];

export default function SalaryPage() {
  const { user } = useAuth();
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);
  const [salarySlips] = useState<SalarySlip[]>(mockSalarySlips);

  const downloadPDF = async () => {
    if (!selectedSlip) return;

    const element = document.getElementById('salary-slip');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`salary-slip-${selectedSlip.month}-${selectedSlip.year}.pdf`);
      toast.success('Salary slip downloaded successfully');
    } catch (error) {
      toast.error('Failed to download salary slip');
    }
  };

  const userSlips = salarySlips.filter(slip => slip.employeeId === user?.id);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <DollarSign className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Salary</h1>
          <p className="text-muted-foreground">View and download your salary slips</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latest Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              ${userSlips[0]?.netPay.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-muted-foreground">
              {userSlips[0] ? `${userSlips[0].month} ${userSlips[0].year}` : 'No salary records'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Earnings YTD</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              ${userSlips.reduce((sum, slip) => sum + slip.netPay, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Year to date earnings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Salary History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userSlips.map((slip) => (
                <div
                  key={slip.id}
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => setSelectedSlip(slip)}
                >
                  <div>
                    <p className="font-medium">{slip.month} {slip.year}</p>
                    <p className="text-sm text-muted-foreground">
                      Paid on {format(new Date(slip.paymentDate), 'PP')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${slip.netPay.toLocaleString()}</p>
                    <Button variant="ghost" size="sm" className="mt-2">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              {userSlips.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No salary records found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedSlip && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Salary Slip</CardTitle>
                <Button onClick={downloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div id="salary-slip" className="space-y-6">
                <div className="text-center border-b pb-4">
                  <h2 className="text-2xl font-bold">Salary Slip</h2>
                  <p className="text-muted-foreground">
                    {selectedSlip.month} {selectedSlip.year}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Employee Name</p>
                    <p>{selectedSlip.employeeName}</p>
                  </div>
                  <div>
                    <p className="font-medium">Designation</p>
                    <p>{selectedSlip.designation}</p>
                  </div>
                  <div>
                    <p className="font-medium">Employee ID</p>
                    <p>{selectedSlip.employeeId}</p>
                  </div>
                  <div>
                    <p className="font-medium">Payment Date</p>
                    <p>{format(new Date(selectedSlip.paymentDate), 'PP')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Earnings</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Basic Salary</span>
                        <span>${selectedSlip.basicSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HRA</span>
                        <span>${selectedSlip.allowances.hra.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transport Allowance</span>
                        <span>${selectedSlip.allowances.transport.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medical Allowance</span>
                        <span>${selectedSlip.allowances.medical.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Deductions</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${selectedSlip.deductions.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insurance</span>
                        <span>${selectedSlip.deductions.insurance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Provident Fund</span>
                        <span>${selectedSlip.deductions.providentFund.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Net Pay</span>
                      <span>${selectedSlip.netPay.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}