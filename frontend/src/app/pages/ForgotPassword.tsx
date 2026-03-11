/**
 * Forgot Password Page
 * Three-step password reset flow:
 * 1. Request reset code via email
 * 2. Verify 6-digit code
 * 3. Set new password
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, Mail, Shield, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

type Step = 'email' | 'code' | 'password';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus first code input when step changes to 'code'
  useEffect(() => {
    if (step === 'code') {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/forgot-password', { email });
      setStep('code');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        setStep('password');
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      setStep('password');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Invalid verification code');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/reset-password', {
        email,
        code: fullCode,
        newPassword,
      });

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { state: { message: 'Password reset successful! Please log in.' } });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/api/auth/forgot-password', { email });
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            {step === 'email' && <Mail className="h-8 w-8 text-primary" />}
            {step === 'code' && <Shield className="h-8 w-8 text-primary" />}
            {step === 'password' && <CheckCircle2 className="h-8 w-8 text-primary" />}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {step === 'email' && 'Reset Password'}
            {step === 'code' && 'Verify Code'}
            {step === 'password' && 'Set New Password'}
          </h1>
          <p className="text-muted-foreground">
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'code' && `We've sent a 6-digit code to ${email}`}
            {step === 'password' && 'Choose a strong, unique password'}
          </p>
        </div>

        {success ? (
          <Alert className="bg-green-50 border-green-200 mb-6">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Password reset successfully! Redirecting to login...
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Email */}
            {step === 'email' && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending Code...' : 'Send Reset Code'}
                </Button>

                <div className="text-center pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Verification Code */}
            {step === 'code' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-center">
                    Enter Verification Code
                  </label>
                  <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        disabled={loading}
                        className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Paste a 6-digit code to auto-fill
                  </p>
                </div>

                <Button
                  onClick={() => {
                    if (code.join('').length === 6) {
                      setStep('password');
                    } else {
                      setError('Please enter all 6 digits');
                    }
                  }}
                  disabled={loading || code.join('').length !== 6}
                  className="w-full"
                >
                  Continue
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Didn't receive the code?
                  </p>
                  <Button
                    variant="link"
                    onClick={handleResend}
                    disabled={loading || resendCooldown > 0}
                    className="text-primary"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend Code'}
                  </Button>
                </div>

                <div className="text-center pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setStep('email');
                      setCode(['', '', '', '', '', '']);
                    }}
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Change Email
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Password must:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                      • At least 8 characters long
                    </li>
                    <li className={newPassword && confirmPassword && newPassword === confirmPassword ? 'text-green-600' : ''}>
                      • Passwords match
                    </li>
                  </ul>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>

                <div className="text-center pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep('code');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Check your spam folder if you don't see the email within a few minutes.
          </p>
        </div>
      </Card>
    </div>
  );
}
