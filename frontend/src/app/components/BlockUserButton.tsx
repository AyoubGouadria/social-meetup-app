/**
 * Block User Button Component
 * Allows users to block other users with reason and confirmation
 */

import { useState } from 'react';
import { Ban, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { blockUser, type BlockUserRequest } from '../../services/moderationService';
import { Alert, AlertDescription } from './ui/alert';

interface BlockUserButtonProps {
  userId: string;
  userName: string;
  onBlockSuccess?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const BLOCK_REASONS = [
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'spam', label: 'Spam or Unwanted Messages' },
  { value: 'inappropriate', label: 'Inappropriate Behavior' },
  { value: 'safety', label: 'Safety Concerns' },
  { value: 'fake_profile', label: 'Fake Profile' },
  { value: 'other', label: 'Other' },
] as const;

export function BlockUserButton({ 
  userId, 
  userName, 
  onBlockSuccess,
  variant = 'destructive',
  size = 'default'
}: BlockUserButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<BlockUserRequest['reason']>('other');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBlock = async () => {
    setError(null);

    if (notes.length > 500) {
      setError('Notes must be less than 500 characters');
      return;
    }

    setLoading(true);

    try {
      await blockUser({
        userId,
        reason,
        notes: notes.trim() || undefined,
      });

      setOpen(false);
      
      // Reset form
      setReason('other');
      setNotes('');
      
      // Notify parent component
      if (onBlockSuccess) {
        onBlockSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to block user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Ban className="mr-2 h-4 w-4" />
          Block User
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Block {userName}?</AlertDialogTitle>
          <AlertDialogDescription>
            When you block this user:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>They won't be able to see your profile or events</li>
              <li>They won't be able to send you messages</li>
              <li>You won't see their events or messages</li>
              <li>You can unblock them later from your settings</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <select
              id="reason"
              className="w-full h-10 px-3 rounded-lg border border-input bg-background"
              value={reason}
              onChange={(e) => setReason(e.target.value as BlockUserRequest['reason'])}
              disabled={loading}
            >
              {BLOCK_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional context (max 500 characters)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {notes.length}/500 characters
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button onClick={handleBlock} disabled={loading} variant="destructive">
            {loading ? 'Blocking...' : 'Block User'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
