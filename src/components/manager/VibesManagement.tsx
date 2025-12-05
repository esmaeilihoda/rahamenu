import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useVibes } from '@/hooks/useVibes';
import { useToast } from '@/hooks/use-toast';

export const VibesManagement = () => {
  const { vibes, isLoading, fetchVibes, createVibe, updateVibe, deleteVibe } = useVibes();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVibe, setEditingVibe] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    emoji: '',
  });

  useEffect(() => {
    fetchVibes();
  }, [fetchVibes]);

  const handleOpenDialog = (vibe?: any) => {
    if (vibe) {
      setEditingVibe(vibe);
      setFormData({
        key: vibe.key,
        label: vibe.label,
        emoji: vibe.emoji || '',
      });
    } else {
      setEditingVibe(null);
      setFormData({
        key: '',
        label: '',
        emoji: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVibe(null);
    setFormData({
      key: '',
      label: '',
      emoji: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.key.trim() || !formData.label.trim()) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'لطفاً فیلدهای ضروری را پر کنید',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingVibe) {
        await updateVibe(editingVibe._id, {
          key: formData.key,
          label: formData.label,
          emoji: formData.emoji || undefined,
        });
      } else {
        await createVibe({
          key: formData.key,
          label: formData.label,
          emoji: formData.emoji || undefined,
        });
      }
      handleCloseDialog();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این vibe مطمئن هستید؟')) return;

    try {
      await deleteVibe(id);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center flex-row-reverse" dir="rtl">
        <div>
          <h2 className="text-2xl font-bold">مدیریت Vibes</h2>
          <p className="text-muted-foreground">ایجاد، ویرایش و حذف Vibes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) handleCloseDialog();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 ml-2" />
              افزودن Vibe جدید
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader dir="rtl">
              <DialogTitle>{editingVibe ? 'ویرایش Vibe' : 'افزودن Vibe جدید'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
              <div>
                <Label htmlFor="key">شناسه (Key) *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="مثلاً: energy"
                  required
                  disabled={editingVibe}
                />
                <p className="text-xs text-muted-foreground mt-1">شناسه نمی‌تواند بعداً تغییر یابد</p>
              </div>

              <div>
                <Label htmlFor="label">نام نمایشی *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="مثلاً: انرژی‌بخش"
                  required
                />
              </div>

              <div>
                <Label htmlFor="emoji">Emoji (اختیاری)</Label>
                <Input
                  id="emoji"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  placeholder="مثلاً: ⚡"
                  maxLength="2"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  لغو
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'در حال ذخیره...' : editingVibe ? 'به‌روزرسانی' : 'افزودن'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vibes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
        {vibes.map((vibe) => (
          <Card key={vibe._id} dir="rtl">
            <CardHeader className="pb-3" dir="rtl">
              <div className="flex items-start justify-between flex-row-reverse gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {vibe.emoji && <span className="text-2xl">{vibe.emoji}</span>}
                    {vibe.label}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    شناسه: <code className="bg-muted px-2 py-1 rounded">{vibe.key}</code>
                  </p>
                </div>
                <Badge variant={vibe.active ? 'default' : 'secondary'}>
                  {vibe.active ? 'فعال' : 'غیرفعال'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent dir="rtl">
              <div className="flex gap-2 justify-start">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenDialog(vibe)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  ویرایش
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => handleDelete(vibe._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vibes.length === 0 && !isLoading && (
        <Card className="p-12 text-center" dir="rtl">
          <h3 className="text-lg font-semibold mb-2">هیچ Vibe‌ای وجود ندارد</h3>
          <p className="text-muted-foreground">برای شروع، یک Vibe جدید اضافه کنید</p>
        </Card>
      )}

      {isLoading && (
        <Card className="p-12 text-center" dir="rtl">
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </Card>
      )}
    </div>
  );
};
