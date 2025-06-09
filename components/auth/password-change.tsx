'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

interface PasswordChangeProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
}

export default function PasswordChange({ isOpen, onClose, email }: PasswordChangeProps) {
    const [step, setStep] = useState<'verify' | 'code' | 'password'>('verify');
    const [verificationEmail, setVerificationEmail] = useState(email);
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSendCode = () => {
        // Mock sending verification code
        toast.success('If your email is found in our system, you will receive a verification code shortly');
        setStep('code');
    };

    const handleVerifyCode = () => {
        if (verificationCode.length === 6) {
            setStep('password');
        } else {
            toast.error('Please enter a valid verification code');
        }
    };

    const handleUpdatePassword = () => {
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        toast.success('Password updated successfully');
        onClose();
        setStep('verify');
        setVerificationCode('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {step === 'verify' && 'Verify Your Email'}
                        {step === 'code' && 'Enter Verification Code'}
                        {step === 'password' && 'Change Password'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'verify' && 'Please verify your email to continue'}
                        {step === 'code' && 'Enter the verification code sent to your email'}
                        {step === 'password' && 'Enter your new password'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {step === 'verify' && (
                        <>
                            <Input
                                type="email"
                                placeholder="Confirm your email"
                                value={verificationEmail}
                                onChange={(e) => setVerificationEmail(e.target.value)}
                            />
                            <Button
                                className="w-full"
                                onClick={handleSendCode}
                                disabled={!verificationEmail}
                            >
                                Send Verification Code
                            </Button>
                        </>
                    )}

                    {step === 'code' && (
                        <>
                            <Input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                            />
                            <Button
                                className="w-full"
                                onClick={handleVerifyCode}
                                disabled={verificationCode.length !== 6}
                            >
                                Verify Code
                            </Button>
                        </>
                    )}

                    {step === 'password' && (
                        <>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleUpdatePassword}
                                disabled={!newPassword || !confirmPassword}
                            >
                                Update Password
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}