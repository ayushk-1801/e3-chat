'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Share2, Copy, Check } from 'lucide-react';

interface ShareButtonProps {
  chatId: string;
  chatTitle: string;
}

export function ShareButton({ chatId, chatTitle }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [shareData, setShareData] = useState<{
    title: string;
    description: string;
    isPublic: boolean;
    shareUrl?: string;
    shareToken?: string;
  }>({
    title: chatTitle,
    description: '',
    isPublic: true,
  });
  const [copied, setCopied] = useState(false);

  const handleCreateShare = async () => {
    if (!shareData.title.trim()) {
      toast.error('Please enter a title for the shared chat');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/chat/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          title: shareData.title,
          description: shareData.description,
          isPublic: shareData.isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create share');
      }

      const result = await response.json();
      setShareData(prev => ({
        ...prev,
        shareUrl: `${window.location.origin}/share/${result.shareToken}`,
        shareToken: result.shareToken,
      }));

      toast.success('Share created successfully!');
    } catch (error) {
      console.error('Error creating share:', error);
      toast.error('Failed to create share. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareData.shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleReset = () => {
    setShareData({
      title: chatTitle,
      description: '',
      isPublic: true,
    });
    setCopied(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    handleReset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Chat</DialogTitle>
          <DialogDescription>
            Create a shareable link for this chat conversation.
          </DialogDescription>
        </DialogHeader>

        {!shareData.shareUrl ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={shareData.title}
                onChange={(e) =>
                  setShareData(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter a title for the shared chat"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={shareData.description}
                onChange={(e) =>
                  setShareData(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="Add a description..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={shareData.isPublic}
                onCheckedChange={(checked) =>
                  setShareData(prev => ({ ...prev, isPublic: checked }))
                }
              />
              <Label htmlFor="public" className="text-sm">
                Make publicly discoverable
              </Label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={shareData.shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium text-sm mb-2">Share Details</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Title:</strong> {shareData.title}</p>
                {shareData.description && (
                  <p><strong>Description:</strong> {shareData.description}</p>
                )}
                <p><strong>Visibility:</strong> {shareData.isPublic ? 'Public' : 'Private'}</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {!shareData.shareUrl ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleCreateShare} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Share'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleReset}>
                Create New Share
              </Button>
              <Button onClick={handleClose}>
                Done
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 