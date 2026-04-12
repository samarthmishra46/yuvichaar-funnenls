'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Trash2, Edit, Copy, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Phase {
  id: number;
  name: string;
  startDay: number;
  endDay: number;
  color: string;
}

interface DayConfig {
  dayNumber: number;
  title: string;
  milestone?: boolean;
  subtasks: string[];
}

interface Template {
  _id: string;
  name: string;
  description?: string;
  totalDays: number;
  phases: Phase[];
  days: DayConfig[];
  isDefault?: boolean;
  createdAt: string;
}

export default function TemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);

  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    totalDays: 30,
  });
  const [phases, setPhases] = useState<Omit<Phase, 'id'>[]>([
    { name: 'Phase 1', startDay: 1, endDay: 10, color: '#8b5cf6' },
  ]);
  const [days, setDays] = useState<DayConfig[]>([]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    totalDays: 30,
  });
  const [editPhases, setEditPhases] = useState<Omit<Phase, 'id'>[]>([]);
  const [editDays, setEditDays] = useState<DayConfig[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchTemplates();
    }
  }, [status, session]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/roadmap-templates');
      const data = await res.json();
      if (res.ok) {
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Fetch templates error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefault = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/roadmap-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ createDefault: true }),
      });

      if (res.ok) {
        toast.success('Default 60-Day template created!');
        await fetchTemplates();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create template');
      }
    } catch (error) {
      toast.error('Failed to create template');
    } finally {
      setCreating(false);
    }
  };

  const handleAddPhase = () => {
    const lastPhase = phases[phases.length - 1];
    const newStartDay = lastPhase ? lastPhase.endDay + 1 : 1;
    const newEndDay = Math.min(newStartDay + 9, newTemplate.totalDays);
    
    const colors = ['#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#e91e8c', '#ef4444', '#06b6d4'];
    const color = colors[phases.length % colors.length];

    setPhases([...phases, { name: `Phase ${phases.length + 1}`, startDay: newStartDay, endDay: newEndDay, color }]);
  };

  const handleRemovePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index));
  };

  const handleUpdatePhase = (index: number, field: keyof Omit<Phase, 'id'>, value: string | number) => {
    const updated = [...phases];
    updated[index] = { ...updated[index], [field]: value };
    setPhases(updated);
  };

  const handleAddDay = () => {
    const existingDays = days.map(d => d.dayNumber);
    let nextDay = 1;
    while (existingDays.includes(nextDay) && nextDay <= newTemplate.totalDays) {
      nextDay++;
    }
    if (nextDay <= newTemplate.totalDays) {
      setDays([...days, { dayNumber: nextDay, title: `Day ${nextDay}`, subtasks: [] }]);
    }
  };

  const handleRemoveDay = (index: number) => {
    setDays(days.filter((_, i) => i !== index));
  };

  const handleUpdateDay = (index: number, field: keyof DayConfig, value: any) => {
    const updated = [...days];
    updated[index] = { ...updated[index], [field]: value };
    setDays(updated);
  };

  const handleAddSubtask = (dayIndex: number) => {
    const updated = [...days];
    updated[dayIndex].subtasks.push('');
    setDays(updated);
  };

  const handleUpdateSubtask = (dayIndex: number, subtaskIndex: number, value: string) => {
    const updated = [...days];
    updated[dayIndex].subtasks[subtaskIndex] = value;
    setDays(updated);
  };

  const handleRemoveSubtask = (dayIndex: number, subtaskIndex: number) => {
    const updated = [...days];
    updated[dayIndex].subtasks = updated[dayIndex].subtasks.filter((_, i) => i !== subtaskIndex);
    setDays(updated);
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (phases.length === 0) {
      toast.error('At least one phase is required');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/roadmap-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTemplate.name,
          description: newTemplate.description,
          totalDays: newTemplate.totalDays,
          phases,
          days: days.filter(d => d.title.trim()),
        }),
      });

      if (res.ok) {
        toast.success('Template created!');
        setShowCreateForm(false);
        setNewTemplate({ name: '', description: '', totalDays: 30 });
        setPhases([{ name: 'Phase 1', startDay: 1, endDay: 10, color: '#8b5cf6' }]);
        setDays([]);
        await fetchTemplates();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create template');
      }
    } catch (error) {
      toast.error('Failed to create template');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await fetch(`/api/roadmap-templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Template deleted');
        await fetchTemplates();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete template');
      }
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    setCreating(true);
    try {
      const res = await fetch('/api/roadmap-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          description: template.description,
          totalDays: template.totalDays,
          phases: template.phases,
          days: template.days,
        }),
      });

      if (res.ok) {
        toast.success('Template duplicated!');
        await fetchTemplates();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to duplicate template');
      }
    } catch (error) {
      toast.error('Failed to duplicate template');
    } finally {
      setCreating(false);
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setEditForm({
      name: template.name,
      description: template.description || '',
      totalDays: template.totalDays,
    });
    setEditPhases(template.phases.map(p => ({ name: p.name, startDay: p.startDay, endDay: p.endDay, color: p.color })));
    setEditDays([...template.days]);
  };

  const handleUpdateEditPhase = (index: number, field: keyof Omit<Phase, 'id'>, value: string | number) => {
    const updated = [...editPhases];
    updated[index] = { ...updated[index], [field]: value };
    setEditPhases(updated);
  };

  const handleAddEditPhase = () => {
    const lastPhase = editPhases[editPhases.length - 1];
    const newStartDay = lastPhase ? lastPhase.endDay + 1 : 1;
    const newEndDay = Math.min(newStartDay + 9, editForm.totalDays);
    const colors = ['#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#e91e8c', '#ef4444', '#06b6d4'];
    const color = colors[editPhases.length % colors.length];
    setEditPhases([...editPhases, { name: `Phase ${editPhases.length + 1}`, startDay: newStartDay, endDay: newEndDay, color }]);
  };

  const handleRemoveEditPhase = (index: number) => {
    setEditPhases(editPhases.filter((_, i) => i !== index));
  };

  const handleAddEditDay = () => {
    const existingDays = editDays.map(d => d.dayNumber);
    let nextDay = 1;
    while (existingDays.includes(nextDay) && nextDay <= editForm.totalDays) {
      nextDay++;
    }
    if (nextDay <= editForm.totalDays) {
      setEditDays([...editDays, { dayNumber: nextDay, title: `Day ${nextDay}`, subtasks: [] }]);
    }
  };

  const handleRemoveEditDay = (index: number) => {
    setEditDays(editDays.filter((_, i) => i !== index));
  };

  const handleUpdateEditDay = (index: number, field: keyof DayConfig, value: any) => {
    const updated = [...editDays];
    updated[index] = { ...updated[index], [field]: value };
    setEditDays(updated);
  };

  const handleAddEditSubtask = (dayIndex: number) => {
    const updated = [...editDays];
    updated[dayIndex].subtasks.push('');
    setEditDays(updated);
  };

  const handleUpdateEditSubtask = (dayIndex: number, subtaskIndex: number, value: string) => {
    const updated = [...editDays];
    updated[dayIndex].subtasks[subtaskIndex] = value;
    setEditDays(updated);
  };

  const handleRemoveEditSubtask = (dayIndex: number, subtaskIndex: number) => {
    const updated = [...editDays];
    updated[dayIndex].subtasks = updated[dayIndex].subtasks.filter((_, i) => i !== subtaskIndex);
    setEditDays(updated);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    if (!editForm.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (editPhases.length === 0) {
      toast.error('At least one phase is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/roadmap-templates/${editingTemplate._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          totalDays: editForm.totalDays,
          phases: editPhases,
          days: editDays.filter(d => d.title.trim()),
        }),
      });

      if (res.ok) {
        toast.success('Template updated!');
        setEditingTemplate(null);
        await fetchTemplates();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update template');
      }
    } catch (error) {
      toast.error('Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#e91e8c]" />
      </div>
    );
  }

  const hasDefaultTemplate = templates.some(t => t.isDefault);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Roadmap Templates</h1>
            <p className="text-sm text-gray-500 mt-1">Create and manage reusable roadmap templates</p>
          </div>
          <div className="flex gap-2">
            {!hasDefaultTemplate && (
              <Button onClick={handleCreateDefault} disabled={creating} variant="outline">
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                Create Default 60-Day
              </Button>
            )}
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <Input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="e.g., 30-Day Quick Start"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={newTemplate.totalDays}
                    onChange={(e) => setNewTemplate({ ...newTemplate, totalDays: parseInt(e.target.value) || 30 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Input
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
              </div>

              {/* Phases */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Phases</label>
                  <Button size="sm" variant="outline" onClick={handleAddPhase}>
                    <Plus className="w-3 h-3 mr-1" /> Add Phase
                  </Button>
                </div>
                <div className="space-y-2">
                  {phases.map((phase, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="color"
                        value={phase.color}
                        onChange={(e) => handleUpdatePhase(idx, 'color', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <Input
                        value={phase.name}
                        onChange={(e) => handleUpdatePhase(idx, 'name', e.target.value)}
                        placeholder="Phase name"
                        className="flex-1"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Day</span>
                        <Input
                          type="number"
                          min={1}
                          max={newTemplate.totalDays}
                          value={phase.startDay}
                          onChange={(e) => handleUpdatePhase(idx, 'startDay', parseInt(e.target.value) || 1)}
                          className="w-16"
                        />
                        <span className="text-xs text-gray-500">to</span>
                        <Input
                          type="number"
                          min={phase.startDay}
                          max={newTemplate.totalDays}
                          value={phase.endDay}
                          onChange={(e) => handleUpdatePhase(idx, 'endDay', parseInt(e.target.value) || phase.startDay)}
                          className="w-16"
                        />
                      </div>
                      {phases.length > 1 && (
                        <button onClick={() => handleRemovePhase(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Days with Subtasks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Days & Tasks (Optional)</label>
                  <Button size="sm" variant="outline" onClick={handleAddDay}>
                    <Plus className="w-3 h-3 mr-1" /> Add Day
                  </Button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {days.map((day, dayIdx) => (
                    <div key={dayIdx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          type="number"
                          min={1}
                          max={newTemplate.totalDays}
                          value={day.dayNumber}
                          onChange={(e) => handleUpdateDay(dayIdx, 'dayNumber', parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                        <Input
                          value={day.title}
                          onChange={(e) => handleUpdateDay(dayIdx, 'title', e.target.value)}
                          placeholder="Day title"
                          className="flex-1"
                        />
                        <label className="flex items-center gap-1 text-xs text-gray-500">
                          <input
                            type="checkbox"
                            checked={day.milestone || false}
                            onChange={(e) => handleUpdateDay(dayIdx, 'milestone', e.target.checked)}
                          />
                          Milestone
                        </label>
                        <button onClick={() => handleRemoveDay(dayIdx)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="pl-4 space-y-1">
                        {day.subtasks.map((subtask, subIdx) => (
                          <div key={subIdx} className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">•</span>
                            <Input
                              value={subtask}
                              onChange={(e) => handleUpdateSubtask(dayIdx, subIdx, e.target.value)}
                              placeholder="Subtask"
                              className="flex-1 h-8 text-sm"
                            />
                            <button onClick={() => handleRemoveSubtask(dayIdx, subIdx)} className="p-1 text-red-400 hover:text-red-600">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAddSubtask(dayIdx)}
                          className="text-xs text-[#e91e8c] hover:underline"
                        >
                          + Add subtask
                        </button>
                      </div>
                    </div>
                  ))}
                  {days.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No days configured. Add days to define milestones and default tasks.</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                <Button onClick={handleCreateTemplate} disabled={creating}>
                  {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Form */}
        {editingTemplate && (
          <Card className="mb-6 border-blue-200">
            <CardHeader>
              <CardTitle>Edit Template: {editingTemplate.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="e.g., 30-Day Quick Start"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={editForm.totalDays}
                    onChange={(e) => setEditForm({ ...editForm, totalDays: parseInt(e.target.value) || 30 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Input
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
              </div>

              {/* Phases */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Phases</label>
                  <Button size="sm" variant="outline" onClick={handleAddEditPhase}>
                    <Plus className="w-3 h-3 mr-1" /> Add Phase
                  </Button>
                </div>
                <div className="space-y-2">
                  {editPhases.map((phase, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="color"
                        value={phase.color}
                        onChange={(e) => handleUpdateEditPhase(idx, 'color', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <Input
                        value={phase.name}
                        onChange={(e) => handleUpdateEditPhase(idx, 'name', e.target.value)}
                        placeholder="Phase name"
                        className="flex-1"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Day</span>
                        <Input
                          type="number"
                          min={1}
                          max={editForm.totalDays}
                          value={phase.startDay}
                          onChange={(e) => handleUpdateEditPhase(idx, 'startDay', parseInt(e.target.value) || 1)}
                          className="w-16"
                        />
                        <span className="text-xs text-gray-500">to</span>
                        <Input
                          type="number"
                          min={phase.startDay}
                          max={editForm.totalDays}
                          value={phase.endDay}
                          onChange={(e) => handleUpdateEditPhase(idx, 'endDay', parseInt(e.target.value) || phase.startDay)}
                          className="w-16"
                        />
                      </div>
                      {editPhases.length > 1 && (
                        <button onClick={() => handleRemoveEditPhase(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Days with Subtasks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Days & Tasks</label>
                  <Button size="sm" variant="outline" onClick={handleAddEditDay}>
                    <Plus className="w-3 h-3 mr-1" /> Add Day
                  </Button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {editDays.map((day, dayIdx) => (
                    <div key={dayIdx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          type="number"
                          min={1}
                          max={editForm.totalDays}
                          value={day.dayNumber}
                          onChange={(e) => handleUpdateEditDay(dayIdx, 'dayNumber', parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                        <Input
                          value={day.title}
                          onChange={(e) => handleUpdateEditDay(dayIdx, 'title', e.target.value)}
                          placeholder="Day title"
                          className="flex-1"
                        />
                        <label className="flex items-center gap-1 text-xs text-gray-500">
                          <input
                            type="checkbox"
                            checked={day.milestone || false}
                            onChange={(e) => handleUpdateEditDay(dayIdx, 'milestone', e.target.checked)}
                          />
                          Milestone
                        </label>
                        <button onClick={() => handleRemoveEditDay(dayIdx)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="pl-4 space-y-1">
                        {day.subtasks.map((subtask, subIdx) => (
                          <div key={subIdx} className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">•</span>
                            <Input
                              value={subtask}
                              onChange={(e) => handleUpdateEditSubtask(dayIdx, subIdx, e.target.value)}
                              placeholder="Subtask"
                              className="flex-1 h-8 text-sm"
                            />
                            <button onClick={() => handleRemoveEditSubtask(dayIdx, subIdx)} className="p-1 text-red-400 hover:text-red-600">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAddEditSubtask(dayIdx)}
                          className="text-xs text-[#e91e8c] hover:underline"
                        >
                          + Add subtask
                        </button>
                      </div>
                    </div>
                  ))}
                  {editDays.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No days configured. Add days to define milestones and default tasks.</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
                <Button onClick={handleSaveTemplate} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Templates List */}
        <div className="space-y-4">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No templates yet. Create your first template to get started.</p>
              </CardContent>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template._id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setExpandedTemplate(expandedTemplate === template._id ? null : template._id)}
                    >
                      <div className="flex items-center gap-2">
                        {expandedTemplate === template._id ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        {template.isDefault && (
                          <Badge className="text-xs bg-gray-100 text-gray-700">Default</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{template.totalDays} days</Badge>
                      </div>
                      {template.description && (
                        <p className="text-sm text-gray-500 mt-1 ml-6">{template.description}</p>
                      )}
                      <div className="flex gap-1 mt-2 ml-6">
                        {template.phases.map((phase) => (
                          <div
                            key={phase.id}
                            className="px-2 py-0.5 rounded text-xs text-white"
                            style={{ backgroundColor: phase.color }}
                          >
                            {phase.name}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateTemplate(template)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {!template.isDefault && (
                        <button
                          onClick={() => handleDeleteTemplate(template._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded View */}
                  {expandedTemplate === template._id && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Days & Tasks</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                        {template.days.map((day) => (
                          <div key={day.dayNumber} className="p-2 bg-gray-50 rounded text-sm">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Day {day.dayNumber}:</span>
                              <span className="text-gray-600">{day.title}</span>
                              {day.milestone && <Badge className="text-[10px] px-1 py-0">★</Badge>}
                            </div>
                            {day.subtasks.length > 0 && (
                              <ul className="mt-1 pl-3 text-xs text-gray-500">
                                {day.subtasks.slice(0, 3).map((s, i) => (
                                  <li key={i}>• {s}</li>
                                ))}
                                {day.subtasks.length > 3 && (
                                  <li className="text-gray-400">+{day.subtasks.length - 3} more</li>
                                )}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
