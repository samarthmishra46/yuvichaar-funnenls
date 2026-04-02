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
  const [mouUploading, setMouUploading] = useState(false);
  const [sowUploading, setSowUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    industry: '',
    logo: '',
    accountManager: '',
    status: 'onboarding',
    mouUrl: '',
    sowUrl: '',
    totalAmount: '',
    minimumPayment: '',
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

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'mou' | 'sow'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = type === 'mou' ? setMouUploading : setSowUploading;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        updateField(type === 'mou' ? 'mouUrl' : 'sowUrl', data.url);
        toast.success(`${type.toUpperCase()} uploaded`);
      } else {
        toast.error('Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }

    if (!form.mouUrl || !form.sowUrl) {
      toast.error('Please upload both MOU and SOW documents');
      return;
    }

    if (!form.totalAmount || !form.minimumPayment) {
      toast.error('Please specify total amount and minimum payment');
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
          <h1 className="text-2xl font-bold text-[#0f172a]">New Organization</h1>
          <p className="text-sm text-[#64748b] mt-1">
            Create a new client organization
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
          <CardHeader>
            <CardTitle className="!text-[#0f172a]">Organization Details</CardTitle>
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
                className="!bg-white !border-[#e2e8f0] !text-[#0f172a] placeholder:!text-[#94a3b8]"
              />
              <Input
                id="org-email"
                label="Email (Client Login) *"
                type="email"
                placeholder="client@acme.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
                className="!bg-white !border-[#e2e8f0] !text-[#0f172a] placeholder:!text-[#94a3b8]"
              />
            </div>

            {/* Phone & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="org-phone"
                label="Phone"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="!bg-white !border-[#e2e8f0] !text-[#0f172a] placeholder:!text-[#94a3b8]"
              />
              <Input
                id="org-website"
                label="Website"
                placeholder="https://acme.com"
                value={form.website}
                onChange={(e) => updateField('website', e.target.value)}
                className="!bg-white !border-[#e2e8f0] !text-[#0f172a] placeholder:!text-[#94a3b8]"
              />
            </div>

            {/* Address */}
            <Input
              id="org-address"
              label="Address"
              placeholder="123 Business St, City"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="!bg-white !border-[#e2e8f0] !text-[#0f172a] placeholder:!text-[#94a3b8]"
            />

            {/* Industry & Account Manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="org-industry"
                label="Industry"
                placeholder="E-commerce, SaaS, etc."
                value={form.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                className="!bg-white !border-[#e2e8f0] !text-[#0f172a] placeholder:!text-[#94a3b8]"
              />
              <Input
                id="org-account-manager"
                label="Account Manager"
                placeholder="Team member name"
                value={form.accountManager}
                onChange={(e) => updateField('accountManager', e.target.value)}
                className="!bg-white !border-[#e2e8f0] !text-[#0f172a] placeholder:!text-[#94a3b8]"
              />
            </div>

            {/* Status */}
            <Select
              id="org-status"
              label="Status"
              options={statusOptions}
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="!bg-white !border-[#e2e8f0] !text-[#0f172a]"
            />

            {/* Logo Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#475569] tracking-wide">
                Logo
              </label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-14 h-14 rounded-xl object-contain bg-[#f8f9fa] border border-[#e2e8f0] p-1"
                  />
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#e2e8f0] text-[#64748b] text-sm font-medium cursor-pointer hover:bg-[#f8f9fa] transition-colors">
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

            {/* Onboarding Documents */}
            <div className="pt-4 border-t border-[#e2e8f0]">
              <h3 className="text-sm font-semibold text-[#0f172a] mb-4">Onboarding Documents *</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MOU Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-semibold text-[#475569] tracking-wide">
                    MOU (Memorandum of Understanding)
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#e2e8f0] text-[#64748b] text-sm font-medium cursor-pointer hover:bg-[#f8f9fa] transition-colors">
                    {mouUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {form.mouUrl ? '✓ MOU Uploaded' : mouUploading ? 'Uploading…' : 'Upload MOU'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleDocumentUpload(e, 'mou')}
                      className="hidden"
                      disabled={mouUploading}
                    />
                  </label>
                </div>

                {/* SOW Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-semibold text-[#475569] tracking-wide">
                    SOW (Statement of Work)
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#e2e8f0] text-[#64748b] text-sm font-medium cursor-pointer hover:bg-[#f8f9fa] transition-colors">
                    {sowUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {form.sowUrl ? '✓ SOW Uploaded' : sowUploading ? 'Uploading…' : 'Upload SOW'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleDocumentUpload(e, 'sow')}
                      className="hidden"
                      disabled={sowUploading}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="pt-4 border-t border-[#e2e8f0]">
              <h3 className="text-sm font-semibold text-[#0f172a] mb-4">Payment Information *</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="org-total-amount"
                  label="Total Amount (₹)"
                  type="number"
                  placeholder="50000"
                  value={form.totalAmount}
                  onChange={(e) => updateField('totalAmount', e.target.value)}
                  required
                  className="!bg-white !border-[#e2e8f0] !text-[#0f172a] placeholder:!text-[#94a3b8]"
                />
                <Input
                  id="org-minimum-payment"
                  label="Minimum Payment (₹)"
                  type="number"
                  placeholder="10000"
                  value={form.minimumPayment}
                  onChange={(e) => updateField('minimumPayment', e.target.value)}
                  required
                  className="!bg-white !border-[#e2e8f0] !text-[#0f172a] placeholder:!text-[#94a3b8]"
                />
              </div>
              <p className="text-xs text-[#475569] mt-2">
                Client will receive an onboarding email to review documents, sign, and pay the minimum amount before setting up their password.
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <Link href="/admin/organizations">
                <Button variant="ghost" type="button" className="!text-[#64748b]">
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
