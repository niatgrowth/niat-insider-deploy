import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import type { SuggestionType } from '../types/articleApi';

const SUGGESTION_OPTIONS: { value: SuggestionType; label: string }[] = [
  { value: 'missing_info', label: 'Missing Info' },
  { value: 'outdated_content', label: 'Outdated Content' },
  { value: 'wrong_info', label: 'Wrong Info' },
  { value: 'add_club_or_facility', label: 'Add a Club or Facility' },
  { value: 'other', label: 'Other' },
];

const MAX_CONTENT_LENGTH = 150;

interface ArticleSuggestionFormProps {
  articleId: string | number;
  onSubmit: (payload: { type: SuggestionType; content: string; is_anonymous?: boolean }) => Promise<void>;
  triggerLabel?: string;
}

export function ArticleSuggestionForm({ articleId: _articleId, onSubmit, triggerLabel = 'Suggest an Improvement' }: ArticleSuggestionFormProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<SuggestionType | ''>('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const contentLength = content.length;
  const isValid = type !== '' && content.trim().length > 0 && contentLength <= MAX_CONTENT_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting || !type) return;
    setSubmitting(true);
    try {
      await onSubmit({ type, content: content.trim().slice(0, MAX_CONTENT_LENGTH), is_anonymous: false });
      setSuccess(true);
      setContent('');
      setType('');
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-[#991b1b] text-[#991b1b] hover:bg-[#fbf2f3] transition-all duration-200 hover:-translate-y-0.5"
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[85vh] overflow-y-auto bg-white text-[#1e293b] border border-[rgba(30,41,59,0.14)] shadow-2xl p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Suggest an Improvement</DialogTitle>
          <DialogDescription className="text-sm text-[#64748b]">
            Tell us what can be improved in this article. Choose a type and add a short note.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <p className="text-center py-6 text-green-600 font-medium animate-in fade-in-0 zoom-in-95 duration-200">
            Thanks! Your suggestion was submitted.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
            <div>
              <Label htmlFor="suggestion-type" className="text-sm font-semibold text-[#1e293b]">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as SuggestionType)} required>
                <SelectTrigger id="suggestion-type" className="mt-1 w-full bg-white border-[rgba(30,41,59,0.2)] text-[#1e293b]">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  sideOffset={6}
                  className="w-[var(--radix-select-trigger-width)] max-h-64 bg-white border border-[rgba(30,41,59,0.14)] text-[#1e293b] shadow-xl"
                >
                  {SUGGESTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="hover:bg-[#fbf2f3] focus:bg-[#fbf2f3]">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="suggestion-content" className="text-sm font-semibold text-[#1e293b]">
                Details (max 150 characters)
              </Label>
              <Textarea
                id="suggestion-content"
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))}
                placeholder="What should be improved?"
                maxLength={MAX_CONTENT_LENGTH}
                rows={3}
                className="mt-1 bg-white border-[rgba(30,41,59,0.2)] text-[#1e293b]"
              />
              <p className="text-xs text-[#64748b] mt-1 text-right">
                {contentLength}/{MAX_CONTENT_LENGTH}
              </p>
            </div>
            <Button
              type="submit"
              disabled={!isValid || submitting}
              className="w-full bg-black text-white hover:bg-[#111] transition-all duration-200"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
