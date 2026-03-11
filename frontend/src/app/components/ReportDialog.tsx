/**
 * Report Dialog Component
 * Allows users to report other users or events for violating community guidelines
 * Compliant with NetzDG reporting requirements
 */

import { useState } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { reportUser, reportEvent, type ReportUserRequest, type ReportEventRequest } from '../../services/moderationService';
import { Alert, AlertDescription } from './ui/alert';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'user' | 'event';
  targetId: string;
  targetName: string;
}

const USER_REPORT_REASONS = [
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'spam', label: 'Spam or Unwanted Contact' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'fake_profile', label: 'Fake Profile or Impersonation' },
  { value: 'hate_speech', label: 'Hate Speech or Discrimination' },
  { value: 'violence_threat', label: 'Violence or Threats' },
  { value: 'illegal_activity', label: 'Illegal Activity' },
  { value: 'underage', label: 'Underage User (under 18)' },
  { value: 'scam', label: 'Scam or Fraud' },
  { value: 'other', label: 'Other (explain below)' },
] as const;

const EVENT_REPORT_REASONS = [
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'harassment', label: 'Harassment or Hate Event' },
  { value: 'spam', label: 'Spam or Fake Event' },
  { value: 'hate_speech', label: 'Promotes Hate Speech' },
  { value: 'violence', label: 'Promotes Violence' },
  { value: 'illegal_activity', label: 'Illegal Activity' },
  { value: 'scam', label: 'Scam or Fraud' },
  { value: 'fake_event', label: 'Fake or Misleading Event' },
  { value: 'other', label: 'Other (explain below)' },
] as const;

export function ReportDialog({ open, onOpenChange, type, targetId, targetName }: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reasons = type === 'user' ? USER_REPORT_REASONS : EVENT_REPORT_REASONS;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (screenshots.length + files.length > 5) {
        setError('Maximum 5 screenshots allowed');
        return;
      }
      setScreenshots([...screenshots, ...files]);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!reason) {
      setError('Please select a reason');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }

    if (description.length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    if (description.length > 1000) {
      setError('Description must be less than 1000 characters');
      return;
    }

    setLoading(true);

    try {
      if (type === 'user') {
        await reportUser({
          userId: targetId,
          reason: reason as ReportUserRequest['reason'],
          description,
          screenshots: screenshots.length > 0 ? screenshots : undefined,
        });
      } else {
        await reportEvent({
          eventId: targetId,
          reason: reason as ReportEventRequest['reason'],
          description,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        // Reset form
        setReason('');
        setDescription('');
        setScreenshots([]);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Report {type === 'user' ? 'User' : 'Event'}: {targetName}
          </DialogTitle>
          <DialogDescription>
            Your report will be reviewed by our moderation team. Serious violations may be forwarded to authorities as required by German law (NetzDG).
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert className="bg-green-50 border-green-200">
            <AlertTriangle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Report submitted successfully. Our team will review it within 24 hours.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <select
                id="reason"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
              >
                <option value="">Select a reason...</option>
                {reasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description * (10-1000 characters)</Label>
              <Textarea
                id="description"
                placeholder="Please provide detailed information about the violation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/1000 characters
              </p>
            </div>

            {type === 'user' && (
              <div className="space-y-2">
                <Label>Screenshots (Optional, max 5)</Label>
                <p className="text-sm text-muted-foreground">
                  Upload screenshots as evidence (chat messages, profile content, etc.)
                </p>

                {screenshots.length > 0 && (
                  <div className="space-y-2">
                    {screenshots.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeScreenshot(index)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {screenshots.length < 5 && (
                  <div>
                    <input
                      type="file"
                      id="screenshots"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={loading}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('screenshots')?.click()}
                      disabled={loading}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Screenshots ({screenshots.length}/5)
                    </Button>
                  </div>
                )}
              </div>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                False reports may result in account suspension. Only submit reports for genuine violations.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !reason || !description}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
