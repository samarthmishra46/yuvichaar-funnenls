'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, Key, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface Organization {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  logo?: string;
  industry?: string;
  accountManager?: string;
  status: string;
}

interface BrandInfoTabProps {
  org: Organization;
  onUpdate: () => void;
}

const statusOptions = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'churned', label: 'Churned' },
];

export default function BrandInfoTab({ org, onUpdate }: BrandInfoTabProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [form, setForm] = useState({
    name: org.name || '',
    email: org.email || '',
    phone: org.phone || '',
    website: org.website || '',
    address: org.address || '',
    logo: org.logo || '',
    industry: org.industry || '',
    accountManager: org.accountManager || '',
    status: org.status || 'onboarding',
  });

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete state
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'logo');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        updateField('logo', data.url);
        toast.success('Logo uploaded');
      }
    } catch {
      toast.error('Logo upload failed');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${org._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to save');
        return;
      }

      toast.success('Organization updated');
      onUpdate();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) {
      toast.error('Enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(`/api/organizations/${org._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to change password');
        return;
      }

      toast.success('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== org.name) {
      toast.error(`Type "${org.name}" to confirm deletion`);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/organizations/${org._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete');
        return;
      }

      toast.success('Organization deleted');
      router.push('/admin/organizations');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Brand Info Card ── */}
      <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
        <CardContent className="space-y-5 pt-6">
          {/* Logo */}
          <div className="flex items-center gap-4 pb-4 border-b border-[rgba(255,255,255,0.06)]">
            {form.logo ? (
              <img
                src={form.logo}
                alt="Logo"
                className="w-16 h-16 rounded-xl object-contain bg-white/5 border border-white/10 p-1"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#64748b] text-xl font-bold">
                {form.name.charAt(0)}
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-[#94a3b8] text-sm font-medium cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-colors">
              {logoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {logoUploading ? 'Uploading…' : 'Change Logo'}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={logoUploading} />
            </label>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="bi-name" label="Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white" />
            <Input id="bi-email" label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="bi-phone" label="Phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white" />
            <Input id="bi-website" label="Website" value={form.website} onChange={(e) => updateField('website', e.target.value)} className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white" />
          </div>

          <Input id="bi-address" label="Address" value={form.address} onChange={(e) => updateField('address', e.target.value)} className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="bi-industry" label="Industry" value={form.industry} onChange={(e) => updateField('industry', e.target.value)} className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white" />
            <Input id="bi-manager" label="Account Manager" value={form.accountManager} onChange={(e) => updateField('accountManager', e.target.value)} className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white" />
          </div>

          <Select id="bi-status" label="Status" options={statusOptions} value={form.status} onChange={(e) => updateField('status', e.target.value)} className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white" />

          <div className="flex justify-end pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Change Password Card ── */}
      <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-[#f472b6]" />
            Change Client Password
          </h4>
          <p className="text-xs text-[#64748b] mb-4">
            Set a new login password for this client. They will need to use this password to log in.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="new-password"
              label="New Password"
              type="password"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white"
            />
            <Input
              id="confirm-password"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white"
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handlePasswordChange} disabled={changingPassword} variant="outline" className="!border-[rgba(255,255,255,0.15)] !text-[#f472b6] hover:!bg-[rgba(244,114,182,0.1)]">
              {changingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Changing…
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Danger Zone - Delete Org ── */}
      <Card className="!bg-[rgba(239,68,68,0.04)] !border-[rgba(239,68,68,0.2)]">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-[#f87171] mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </h4>
          <p className="text-sm text-[#94a3b8] mb-4">
            Permanently delete this organization and all its data (videos, research, custom sections).
            This action <strong className="text-[#f87171]">cannot be undone</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <Input
                id="delete-confirm"
                label={`Type "${org.name}" to confirm`}
                placeholder={org.name}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="!bg-[rgba(239,68,68,0.06)] !border-[rgba(239,68,68,0.2)] !text-white placeholder:!text-[#64748b]"
              />
            </div>
            <Button
              onClick={handleDelete}
              disabled={deleting || deleteConfirm !== org.name}
              variant="outline"
              className="!border-[rgba(239,68,68,0.4)] !text-[#f87171] hover:!bg-[rgba(239,68,68,0.1)] disabled:!opacity-40"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Organization
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
