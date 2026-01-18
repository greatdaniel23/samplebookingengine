import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Tag, Check, X } from 'lucide-react';
import { paths } from '@/config/paths';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface GTMCode {
    id: string;
    container_id: string;
    name: string;
    enabled: boolean;
    created_at?: string;
    updated_at?: string;
}

export default function GTMSettingsSection() {
    const [gtmCodes, setGtmCodes] = useState<GTMCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [newContainerId, setNewContainerId] = useState('');
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContainerId, setEditContainerId] = useState('');
    const [editName, setEditName] = useState('');

    const fetchGTMCodes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(paths.buildApiUrl('/gtm'));
            const data = await response.json();
            if (data.success) {
                setGtmCodes(data.data?.gtm_codes || []);
            } else {
                setError(data.error || 'Failed to load GTM codes');
            }
        } catch (err) {
            setError('Failed to connect to API');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGTMCodes();
    }, []);

    const handleAddCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newContainerId.trim()) return;

        setSaving(true);
        try {
            const response = await fetch(paths.buildApiUrl('/gtm'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    container_id: newContainerId.trim(),
                    name: newName.trim() || newContainerId.trim(),
                    enabled: true,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setNewContainerId('');
                setNewName('');
                fetchGTMCodes();
            } else {
                setError(data.error || 'Failed to add GTM code');
            }
        } catch (err) {
            setError('Failed to add GTM code');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleEnabled = async (code: GTMCode) => {
        try {
            const response = await fetch(paths.buildApiUrl(`/gtm/${code.id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !code.enabled }),
            });
            if (response.ok) {
                fetchGTMCodes();
            }
        } catch (err) {
            setError('Failed to update GTM code');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this GTM code?')) return;

        try {
            const response = await fetch(paths.buildApiUrl(`/gtm/${id}`), {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchGTMCodes();
            }
        } catch (err) {
            setError('Failed to delete GTM code');
        }
    };

    const startEdit = (code: GTMCode) => {
        setEditingId(code.id);
        setEditContainerId(code.container_id);
        setEditName(code.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContainerId('');
        setEditName('');
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;

        try {
            const response = await fetch(paths.buildApiUrl(`/gtm/${editingId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    container_id: editContainerId.trim(),
                    name: editName.trim(),
                }),
            });
            if (response.ok) {
                cancelEdit();
                fetchGTMCodes();
            }
        } catch (err) {
            setError('Failed to update GTM code');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">GTM Settings</h2>
                    <p className="text-muted-foreground">
                        Manage Google Tag Manager container codes
                    </p>
                </div>
                <Tag className="h-8 w-8 text-muted-foreground" />
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                    {error}
                    <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-2">
                        Dismiss
                    </Button>
                </div>
            )}

            {/* Add New GTM Code */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add GTM Container
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddCode} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Label htmlFor="container_id">Container ID</Label>
                            <Input
                                id="container_id"
                                placeholder="GTM-XXXXXXX"
                                value={newContainerId}
                                onChange={(e) => setNewContainerId(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="name">Name (optional)</Label>
                            <Input
                                id="name"
                                placeholder="Main Analytics"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={saving || !newContainerId.trim()}>
                            {saving ? 'Adding...' : 'Add'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* GTM Codes List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Active Containers</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : gtmCodes.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No GTM codes configured. Add one above.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {gtmCodes.map((code) => (
                                <div
                                    key={code.id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    {editingId === code.id ? (
                                        <>
                                            <div className="flex gap-2 flex-1">
                                                <Input
                                                    value={editContainerId}
                                                    onChange={(e) => setEditContainerId(e.target.value)}
                                                    placeholder="GTM-XXXXXXX"
                                                    className="max-w-[200px]"
                                                />
                                                <Input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    placeholder="Name"
                                                    className="max-w-[200px]"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={handleSaveEdit}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-4">
                                                <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                                                    {code.container_id}
                                                </code>
                                                <span className="text-muted-foreground">{code.name}</span>
                                                <Badge variant={code.enabled ? 'default' : 'secondary'}>
                                                    {code.enabled ? 'Active' : 'Disabled'}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleToggleEnabled(code)}
                                                >
                                                    {code.enabled ? 'Disable' : 'Enable'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => startEdit(code)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(code.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
