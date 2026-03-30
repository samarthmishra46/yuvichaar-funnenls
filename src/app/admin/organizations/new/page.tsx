'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statusOptions = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'churned', label: 'Churned' },
];

export default function NewOrganizationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    website: '',
    address: '',
    industry: '',
    logo: '',
    accountManager: '',
    status: 'onboarding',
  });

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
        setLogoPreview(data.url);
        toast.success('Logo uploaded');
      } else {
        toast.error('Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email, and password are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create organization');
        return;
      }

      toast.success('Organization created successfully');
      router.push('/admin/organizations');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/organizations"
          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-[#94a3b8]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">New Organization</h1>
          <p className="text-sm text-[#64748b] mt-1">
            Create a new client organization
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="!text-white">Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="org-name"
                label="Organization Name *"
                placeholder="Acme Corp"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
              />
              <Input
                id="org-email"
                label="Email (Client Login) *"
                type="email"
                placeholder="client@acme.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
                className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
              />
            </div>

            {/* Password */}
            <Input
              id="org-password"
              label="Client Password *"
              type="password"
              placeholder="Set their login password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
              className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
            />

            {/* Phone & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="org-phone"
                label="Phone"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
              />
              <Input
                id="org-website"
                label="Website"
                placeholder="https://acme.com"
                value={form.website}
                onChange={(e) => updateField('website', e.target.value)}
                className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
              />
            </div>

            {/* Address */}
            <Input
              id="org-address"
              label="Address"
              placeholder="123 Business St, City"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
            />

            {/* Industry & Account Manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="org-industry"
                label="Industry"
                placeholder="E-commerce, SaaS, etc."
                value={form.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
              />
              <Input
                id="org-account-manager"
                label="Account Manager"
                placeholder="Team member name"
                value={form.accountManager}
                onChange={(e) => updateField('accountManager', e.target.value)}
                className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
              />
            </div>

            {/* Status */}
            <Select
              id="org-status"
              label="Status"
              options={statusOptions}
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white"
            />

            {/* Logo Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#cbd5e1] tracking-wide">
                Logo
              </label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-14 h-14 rounded-xl object-contain bg-white/5 border border-white/10 p-1"
                  />
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-[#94a3b8] text-sm font-medium cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                  {logoUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {logoUploading ? 'Uploading…' : 'Upload Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={logoUploading}
                  />
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <Link href="/admin/organizations">
                <Button variant="ghost" type="button" className="!text-[#94a3b8]">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  'Create Organization'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
