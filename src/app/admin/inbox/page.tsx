'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Inbox,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Filter,
  X,
  ExternalLink,
  Clock,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface AdminMessage {
  _id: string;
  type: 'leave_request' | 'task_completed' | 'client_request' | 'system';
  title: string;
  message: string;
  fromType: 'staff' | 'client' | 'system';
  fromName: string;
  fromEmail?: string;
  orgId?: string;
  orgName?: string;
  relatedId?: string;
  metadata?: {
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    taskTitle?: string;
    dayNumber?: number;
    proofOfWorkType?: string;
    proofOfWorkUrl?: string;
    requestType?: string;
  };
  isRead: boolean;
  createdAt: string;
}

interface Organization {
  _id: string;
  name: string;
}

const typeLabels: Record<string, string> = {
  leave_request: 'Leave Request',
  task_completed: 'Task Completed',
  client_request: 'Client Request',
  system: 'System',
};

const typeIcons: Record<string, React.ElementType> = {
  leave_request: Calendar,
  task_completed: CheckCircle2,
  client_request: MessageSquare,
  system: Inbox,
};

const typeBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'purple'> = {
  leave_request: 'warning',
  task_completed: 'success',
  client_request: 'purple',
  system: 'default',
};

export default function AdminInboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [counts, setCounts] = useState({ leave_request: 0, task_completed: 0, client_request: 0 });
  const [filterType, setFilterType] = useState<string>('all');
  const [filterOrg, setFilterOrg] = useState<string>('');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchMessages();
    fetchOrganizations();
  }, [session, status, router]);

  const fetchMessages = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.set('type', filterType);
      if (filterOrg) params.set('orgId', filterOrg);
      if (filterRead !== 'all') params.set('isRead', filterRead === 'read' ? 'true' : 'false');

      const res = await fetch(`/api/admin/inbox?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
        setCounts(data.counts || { leave_request: 0, task_completed: 0, client_request: 0 });
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterOrg, filterRead]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchMessages();
    }
  }, [filterType, filterOrg, filterRead, fetchMessages, session]);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/organizations');
      const data = await res.json();
      if (res.ok) {
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Fetch organizations error:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/inbox/${id}`, { method: 'PATCH' });
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isRead: true } : m))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleLeaveAction = async (leaveId: string, action: 'approved' | 'rejected', response: string, isCompRequest: boolean = false) => {
    setActionLoading(true);
    try {
      const endpoint = isCompRequest ? `/api/leaves/comp-request/${leaveId}` : `/api/leaves/${leaveId}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, adminResponse: response }),
      });

      if (res.ok) {
        toast.success(`Leave ${action} successfully`);
        setSelectedMessage(null);
        fetchMessages();
      } else {
        toast.error('Failed to update leave');
      }
    } catch (error) {
      toast.error('Failed to update leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClientRequestAction = async (requestId: string, status: string, response: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/client-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminResponse: response }),
      });

      if (res.ok) {
        toast.success('Request updated successfully');
        setSelectedMessage(null);
        fetchMessages();
      } else {
        toast.error('Failed to update request');
      }
    } catch (error) {
      toast.error('Failed to update request');
    } finally {
      setActionLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#e91e8c]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Inbox</h1>
          <p className="text-sm text-[#64748b] mt-1">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterType('all')}
          className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all ${
            filterType === 'all' ? 'border-[#e91e8c] ring-2 ring-[#fdf2f8]' : 'border-[#e2e8f0] hover:border-[#e91e8c]'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Inbox className="w-5 h-5 text-[#e91e8c]" />
            <span className="text-sm text-[#64748b]">All Messages</span>
          </div>
          <p className="text-2xl font-bold text-[#0f172a]">{unreadCount}</p>
        </div>
        <div
          onClick={() => setFilterType('leave_request')}
          className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all ${
            filterType === 'leave_request' ? 'border-[#f59e0b] ring-2 ring-[#fef3c7]' : 'border-[#e2e8f0] hover:border-[#f59e0b]'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-[#f59e0b]" />
            <span className="text-sm text-[#64748b]">Leave Requests</span>
          </div>
          <p className="text-2xl font-bold text-[#f59e0b]">{counts.leave_request}</p>
        </div>
        <div
          onClick={() => setFilterType('task_completed')}
          className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all ${
            filterType === 'task_completed' ? 'border-[#22c55e] ring-2 ring-[#dcfce7]' : 'border-[#e2e8f0] hover:border-[#22c55e]'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
            <span className="text-sm text-[#64748b]">Tasks Completed</span>
          </div>
          <p className="text-2xl font-bold text-[#22c55e]">{counts.task_completed}</p>
        </div>
        <div
          onClick={() => setFilterType('client_request')}
          className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all ${
            filterType === 'client_request' ? 'border-[#9333ea] ring-2 ring-[#f3e8ff]' : 'border-[#e2e8f0] hover:border-[#9333ea]'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-[#9333ea]" />
            <span className="text-sm text-[#64748b]">Client Requests</span>
          </div>
          <p className="text-2xl font-bold text-[#9333ea]">{counts.client_request}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#64748b]" />
          <span className="text-sm text-[#64748b]">Filter:</span>
        </div>
        <select
          value={filterOrg}
          onChange={(e) => setFilterOrg(e.target.value)}
          className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
        >
          <option value="">All Organizations</option>
          {organizations.map((org) => (
            <option key={org._id} value={org._id}>
              {org.name}
            </option>
          ))}
        </select>
        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
          className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
        >
          <option value="all">All</option>
          <option value="unread">Unread Only</option>
          <option value="read">Read Only</option>
        </select>
        {(filterType !== 'all' || filterOrg || filterRead !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterType('all');
              setFilterOrg('');
              setFilterRead('all');
            }}
            className="!text-[#64748b]"
          >
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0]">
          <Inbox className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
          <p className="text-[#0f172a] font-semibold">No messages</p>
          <p className="text-sm text-[#64748b] mt-1">Your inbox is empty</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => {
            const Icon = typeIcons[msg.type] || Inbox;
            return (
              <div
                key={msg._id}
                onClick={() => {
                  if (!msg.isRead) markAsRead(msg._id);
                  setSelectedMessage(msg);
                }}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                  msg.isRead ? 'border-[#e2e8f0]' : 'border-[#e91e8c] bg-[#fdf2f8]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-xl ${msg.isRead ? 'bg-[#f8f9fa]' : 'bg-white'}`}>
                    <Icon className={`w-5 h-5 ${msg.isRead ? 'text-[#64748b]' : 'text-[#e91e8c]'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`truncate ${msg.isRead ? 'text-[#0f172a] font-medium' : 'text-[#0f172a] font-bold'}`}>
                        {msg.title}
                      </h3>
                      <Badge variant={typeBadgeVariant[msg.type]}>{typeLabels[msg.type]}</Badge>
                    </div>
                    <p className={`text-sm truncate ${msg.isRead ? 'text-[#64748b]' : 'text-[#475569]'}`}>
                      {msg.message}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#94a3b8]">
                      <span>From: {msg.fromName}</span>
                      {msg.orgName && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {msg.orgName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {!msg.isRead && (
                    <div className="w-3 h-3 rounded-full bg-[#e91e8c] shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onLeaveAction={handleLeaveAction}
          onClientRequestAction={handleClientRequestAction}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}

function MessageDetailModal({
  message,
  onClose,
  onLeaveAction,
  onClientRequestAction,
  actionLoading,
}: {
  message: AdminMessage;
  onClose: () => void;
  onLeaveAction: (id: string, action: 'approved' | 'rejected', response: string, isCompRequest?: boolean) => void;
  onClientRequestAction: (id: string, status: string, response: string) => void;
  actionLoading: boolean;
}) {
  const [response, setResponse] = useState('');
  const Icon = typeIcons[message.type] || Inbox;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="!bg-white !border-[#e2e8f0] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#fdf2f8]">
                <Icon className="w-6 h-6 text-[#e91e8c]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0f172a]">{message.title}</h2>
                <p className="text-sm text-[#64748b]">
                  From: {message.fromName} {message.fromEmail && `(${message.fromEmail})`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#f8f9fa] text-[#64748b]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-[#f8f9fa] rounded-xl p-4 mb-4">
            <p className="text-[#0f172a] whitespace-pre-wrap">{message.message}</p>
          </div>

          {/* Metadata */}
          {message.metadata && (
            <div className="space-y-2 mb-4">
              {message.metadata.leaveType && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#64748b]">Leave Type:</span>
                  <span className="text-[#0f172a] font-medium capitalize">{message.metadata.leaveType}</span>
                </div>
              )}
              {message.metadata.startDate && message.metadata.endDate && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#64748b]">Duration:</span>
                  <span className="text-[#0f172a] font-medium">
                    {new Date(message.metadata.startDate).toLocaleDateString()} - {new Date(message.metadata.endDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {message.metadata.taskTitle && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#64748b]">Task:</span>
                  <span className="text-[#0f172a] font-medium">{message.metadata.taskTitle}</span>
                </div>
              )}
              {message.metadata.dayNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#64748b]">Day:</span>
                  <span className="text-[#0f172a] font-medium">Day {message.metadata.dayNumber}</span>
                </div>
              )}
              {message.metadata.proofOfWorkUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#64748b]">Proof:</span>
                  <a
                    href={message.metadata.proofOfWorkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#e91e8c] hover:underline flex items-center gap-1"
                  >
                    View Attachment <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Actions for Leave Requests */}
          {message.type === 'leave_request' && message.relatedId && (
            <div className="border-t border-[#e2e8f0] pt-4 mt-4">
              {message.metadata?.leaveType === 'compensatory' && (
                <div className="mb-3 p-3 bg-[#ccfbf1] rounded-xl text-sm text-[#0d9488]">
                  <strong>Compensatory Leave Request:</strong> Approving will add 1 day to the staff&apos;s comp leave balance.
                </div>
              )}
              <label className="text-sm font-semibold text-[#475569] block mb-2">Response (optional)</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Add a response message..."
                rows={2}
                className="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c] resize-none mb-3"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => onLeaveAction(message.relatedId!, 'rejected', response, message.metadata?.leaveType === 'compensatory')}
                  disabled={actionLoading}
                  className="!border-[#ef4444] !text-[#ef4444] hover:!bg-[#fee2e2]"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => onLeaveAction(message.relatedId!, 'approved', response, message.metadata?.leaveType === 'compensatory')}
                  disabled={actionLoading}
                  className="!bg-[#22c55e] hover:!bg-[#16a34a]"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                </Button>
              </div>
            </div>
          )}

          {/* Actions for Client Requests */}
          {message.type === 'client_request' && message.relatedId && (
            <div className="border-t border-[#e2e8f0] pt-4 mt-4">
              <label className="text-sm font-semibold text-[#475569] block mb-2">Response</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Add a response message..."
                rows={2}
                className="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c] resize-none mb-3"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => onClientRequestAction(message.relatedId!, 'in_progress', response)}
                  disabled={actionLoading}
                  className="!border-[#f59e0b] !text-[#f59e0b]"
                >
                  Mark In Progress
                </Button>
                <Button
                  onClick={() => onClientRequestAction(message.relatedId!, 'completed', response)}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark Completed'}
                </Button>
              </div>
            </div>
          )}

          <p className="text-xs text-[#94a3b8] mt-4">
            Received: {new Date(message.createdAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
