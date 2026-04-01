'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, User, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Staff {
  _id: string;
  email: string;
  name: string;
  role?: string;
  createdAt: string;
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    role: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (res.ok) {
        setStaff(data.staff || []);
      }
    } catch (error) {
      console.error('Fetch staff error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!form.email || !form.name || !form.password) {
      toast.error('Email, name, and password are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to add staff member');
        return;
      }

      toast.success('Staff member added successfully');
      setForm({ email: '', name: '', password: '', role: '' });
      setShowAddForm(false);
      await fetchStaff();
    } catch (error) {
      console.error('Add staff error:', error);
      toast.error('Failed to add staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStaff = async (id: string) => {
    if (!editForm.email || !editForm.name) {
      toast.error('Email and name are required');
      return;
    }

    setSubmitting(true);
    try {
      const updateData: any = {
        email: editForm.email,
        name: editForm.name,
        role: editForm.role,
      };

      if (editForm.password) {
        updateData.password = editForm.password;
      }

      const res = await fetch(`/api/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to update staff member');
        return;
      }

      toast.success('Staff member updated successfully');
      setEditingId(null);
      setEditForm({ name: '', email: '', role: '', password: '' });
      await fetchStaff();
    } catch (error) {
      console.error('Update staff error:', error);
      toast.error('Failed to update staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to delete staff member');
        return;
      }

      toast.success('Staff member deleted successfully');
      setDeletingId(null);
      await fetchStaff();
    } catch (error) {
      console.error('Delete staff error:', error);
      toast.error('Failed to delete staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (member: Staff) => {
    setEditingId(member._id);
    setEditForm({
      name: member.name,
      email: member.email,
      role: member.role || '',
      password: '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', email: '', role: '', password: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#f472b6]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Management</h1>
          <p className="text-sm text-[#64748b] mt-1">Manage your team members</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4" />
          Add Staff Member
        </Button>
      </div>

      {/* Add Staff Form */}
      {showAddForm && (
        <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)] mb-6">
          <CardHeader>
            <CardTitle className="!text-white">Add New Staff Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="staff-name"
                label="Full Name *"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
              />
              <Input
                id="staff-email"
                label="Email *"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="staff-password"
                label="Password *"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
              />
              <Input
                id="staff-role"
                label="Role"
                placeholder="Developer, Designer, etc."
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowAddForm(false)}
                className="!text-[#94a3b8]"
              >
                Cancel
              </Button>
              <Button onClick={handleAddStaff} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Staff Member'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff List */}
      {staff.length === 0 ? (
        <div className="text-center py-16">
          <User className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
          <p className="text-[#64748b] mb-4">No staff members yet</p>
          <Button onClick={() => setShowAddForm(true)} variant="outline" className="!border-[rgba(255,255,255,0.1)] !text-[#94a3b8]">
            <Plus className="w-4 h-4" />
            Add your first staff member
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <Card key={member._id} className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
              <CardContent className="p-5">
                {editingId === member._id ? (
                  <div className="space-y-3">
                    <Input
                      id={`edit-name-${member._id}`}
                      label="Name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
                    />
                    <Input
                      id={`edit-email-${member._id}`}
                      label="Email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
                    />
                    <Input
                      id={`edit-role-${member._id}`}
                      label="Role"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
                    />
                    <Input
                      id={`edit-password-${member._id}`}
                      label="New Password (optional)"
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
                    />
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditStaff(member._id)}
                        disabled={submitting}
                        className="flex-1"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEdit}
                        disabled={submitting}
                        className="!text-[#94a3b8]"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : deletingId === member._id ? (
                  <div className="space-y-3">
                    <p className="text-white text-sm">Delete {member.name}?</p>
                    <p className="text-[#94a3b8] text-xs">This action cannot be undone.</p>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteStaff(member._id)}
                        disabled={submitting}
                        className="flex-1"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingId(null)}
                        disabled={submitting}
                        className="!text-[#94a3b8]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9333ea] to-[#e91e8c] flex items-center justify-center text-white font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{member.name}</h3>
                        <p className="text-sm text-[#64748b] truncate">{member.email}</p>
                        {member.role && (
                          <p className="text-xs text-[#94a3b8] mt-1">{member.role}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(member)}
                        className="flex-1 !text-[#94a3b8] hover:!text-white"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingId(member._id)}
                        className="flex-1 !text-[#ef4444] hover:!text-[#dc2626]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
