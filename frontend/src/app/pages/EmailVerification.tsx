/**
 * Email Verification Page
 * Allows users to verify their email address with a 6-digit code
 * Required for GDPR compliance and security
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Mail, CheckCircle2, AlertTriangle } from 'lucide-react';
import authService from '../../services/authService';
import api from '../../services/api';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
    } else if (user.isEmailVerified) {
      // Already verified, redirect to home
      navigate('/home');
    }
  }, [navigate]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

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
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace if current is empty
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
    
    // Only accept 6-digit numbers
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      
      // Auto-submit
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const finalCode = verificationCode || code.join('');

    if (finalCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/api/auth/verify-email', { code: finalCode });
      
      // Update local user data
      const user = authService.getCurrentUser();
      if (user) {
        user.isEmailVerified = true;
        localStorage.setItem('user', JSON.stringify(user));
      }

      setSuccess(true);

      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid verification code. Please try again.');
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
      await api.post('/api/auth/resend-verification');
      setResendCooldown(60); // 60-second cooldown
      
      // Show success message
      setError(null);
      const message = document.createElement('div');
      message.textContent = 'Verification code sent! Check your email.';
      message.className = 'text-sm text-green-600 mt-2';
      setTimeout(() => message.remove(), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const user = authService.getCurrentUser();
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
          <p className="text-muted-foreground">
            We've sent a 6-digit code to <strong>{user.email}</strong>
          </p>
        </div>

        {success ? (
          <Alert className="bg-green-50 border-green-200 mb-6">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Email verified successfully! Redirecting...
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

            <div className="space-y-6">
              {/* Code Input */}
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
                      disabled={loading || success}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Paste a 6-digit code to auto-fill
                </p>
              </div>

              {/* Manual Submit Button */}
              <Button
                onClick={() => handleVerify()}
                disabled={loading || success || code.join('').length !== 6}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>

              {/* Resend Code */}
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

              {/* Skip for Now */}
              <div className="text-center pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/home')}
                  disabled={loading}
                  className="text-muted-foreground"
                >
                  I'll verify later
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Email verification is required for security and GDPR compliance. 
            Check your spam folder if you don't see the email.
          </p>
        </div>
      </Card>
    </div>
  );
}
