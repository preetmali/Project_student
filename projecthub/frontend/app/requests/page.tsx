'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { JoinRequest } from '../../types';
import { JoinRequestCard } from '../../components/ui/JoinRequestCard';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../lib/auth-context';

export default function MyRequestsPage() {
  const { activeUserId } = useAuth();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const loadRequests = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const data = await api.getMyJoinRequests();
      setRequests(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to load join requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [activeUserId]);

  const handleCancelRequest = async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.cancelJoinRequest(id);
      setActionSuccess('Join request cancelled successfully.');
      await loadRequests();
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel join request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={3} type="list" />;
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div>
        <h1 className="font-montserrat text-2xl font-bold text-white">My Join Requests</h1>
        <p className="font-sans text-xs text-stone-400 mt-1">
          Track join requests submitted to project teams and manage active applications.
        </p>
      </div>

      {actionError && (
        <div className="p-4 rounded border border-red-500/40 bg-red-950/40 text-red-300 text-xs font-sans">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded border border-stone-700 bg-stone-900/60 text-stone-200 text-xs font-sans">
          ✓ {actionSuccess}
        </div>
      )}

      {/* Requests List */}
      {requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map(req => (
            <JoinRequestCard
              key={req.id}
              request={req}
              mode="sent"
              onCancel={handleCancelRequest}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No join requests submitted"
          description="You haven't submitted any requests to join external project teams yet. Discover open projects and apply!"
          actionLabel="Browse Projects to Join"
          actionHref="/projects"
        />
      )}
    </div>
  );
}
