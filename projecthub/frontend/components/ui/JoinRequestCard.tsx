import React from 'react';
import { JoinRequest } from '../../types';
import { StatusBadge } from './StatusBadge';

interface JoinRequestCardProps {
  request: JoinRequest;
  mode: 'received' | 'sent';
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  actionLoading?: boolean;
}

export const JoinRequestCard: React.FC<JoinRequestCardProps> = ({
  request,
  mode,
  onAccept,
  onReject,
  onCancel,
  actionLoading,
}) => {
  const isPending = request.status === 'pending';
  const name = request.requester_profile?.full_name || 'Student Candidate';
  const dateStr = new Date(request.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="card-chai p-5 space-y-4">
      <div className="flex justify-between items-start gap-3">
        <div>
          {mode === 'received' ? (
            <h4 className="font-montserrat text-sm font-semibold text-white">{name}</h4>
          ) : (
            <h4 className="font-montserrat text-sm font-semibold text-white">
              {request.project?.title || 'Project Request'}
            </h4>
          )}
          <p className="font-mono text-xs text-stone-400 mt-0.5">Submitted on {dateStr}</p>
        </div>
        <StatusBadge status={request.status} type="request" />
      </div>

      {request.message && (
        <div className="bg-stone-900/60 p-3 rounded-md border border-stone-800 text-xs text-stone-300 font-sans italic">
          "{request.message}"
        </div>
      )}

      {mode === 'received' && isPending && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onAccept && onAccept(request.id)}
            disabled={actionLoading}
            className="btn-asym flex-1 py-2 px-3 text-xs font-montserrat font-semibold disabled:opacity-50"
          >
            Accept Candidate
          </button>
          <button
            onClick={() => onReject && onReject(request.id)}
            disabled={actionLoading}
            className="flex-1 py-2 px-3 rounded border border-red-500/30 text-red-300 bg-red-950/30 hover:bg-red-900/40 text-xs font-montserrat font-semibold transition-all disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {mode === 'sent' && isPending && onCancel && (
        <div className="flex justify-end pt-1">
          <button
            onClick={() => onCancel(request.id)}
            disabled={actionLoading}
            className="btn-asym-mirror py-1.5 px-4 text-xs font-montserrat font-semibold"
          >
            Cancel Request
          </button>
        </div>
      )}
    </div>
  );
};
