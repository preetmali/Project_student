import React, { useState } from 'react';
import { Project } from '../../types';

interface JoinRequestModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
}

export const JoinRequestModal: React.FC<JoinRequestModalProps> = ({
  project,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(message);
      setMessage('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit join request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="card-chai w-full max-w-lg p-6 space-y-5">
        <div className="flex justify-between items-center pb-4 border-b border-stone-800">
          <div>
            <h3 className="font-montserrat text-lg font-bold text-white">Request to Join Team</h3>
            <p className="font-sans text-xs highlight">{project.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded border border-red-500/40 bg-red-950/40 text-red-300 text-xs font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-montserrat font-medium text-stone-300 mb-1.5">
              Introduction & Contribution Message
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Hi! I have experience with Python & ML and would love to contribute to your team..."
              rows={4}
              maxLength={1000}
              className="w-full px-3.5 py-2.5 rounded bg-stone-900 border border-stone-800 text-white font-sans text-sm focus:outline-none focus:border-stone-500 placeholder:text-stone-600"
            />
            <p className="text-[11px] font-mono text-stone-500 mt-1 text-right">{message.length} / 1000</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-asym-mirror flex-1 py-2.5 px-4 text-xs font-montserrat font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-asym flex-1 py-2.5 px-4 text-xs font-montserrat font-semibold disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Join Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
