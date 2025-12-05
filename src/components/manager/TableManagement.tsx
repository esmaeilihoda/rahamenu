import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  position?: { x: number; y: number };
  qrCode?: string;
}

export const TableManagement = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    positionX: '',
    positionY: '',
  });

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    console.log('Dialog open state:', isDialogOpen, 'Editing table:', editingTable);
  }, [isDialogOpen, editingTable]);

  const fetchTables = async () => {
    try {
      const { data } = await apiClient.get('/tables');
      setTables(data.data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: error.response?.data?.error || 'خطا در دریافت میزها',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        tableNumber: parseInt(formData.tableNumber),
        capacity: parseInt(formData.capacity),
        position: formData.positionX && formData.positionY
          ? { x: parseInt(formData.positionX), y: parseInt(formData.positionY) }
          : undefined,
      };

      if (editingTable) {
        const { data } = await apiClient.put(`/tables/${editingTable._id}`, payload);
        // Update the table in the local state immediately
        if (data.data) {
          setTables(tables.map(t => t._id === editingTable._id ? data.data : t));
        } else {
          await fetchTables();
        }
        toast({ title: '✅ میز به‌روزرسانی شد' });
      } else {
        await apiClient.post('/tables', payload);
        await fetchTables();
        toast({ title: '✅ میز جدید اضافه شد' });
      }

      handleCloseDialog();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: error.response?.data?.error || 'خطا در ذخیره میز',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این میز مطمئن هستید؟')) return;

    try {
      await apiClient.delete(`/tables/${id}`);
      toast({ title: '🗑️ میز حذف شد' });
      await fetchTables();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: error.response?.data?.error || 'خطا در حذف میز',
      });
    }
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      tableNumber: String(table.tableNumber || ''),
      capacity: String(table.capacity || ''),
      positionX: table.position?.x ? String(table.position.x) : '',
      positionY: table.position?.y ? String(table.position.y) : '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTable(null);
    setFormData({
      tableNumber: '',
      capacity: '',
      positionX: '',
      positionY: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'occupied':
        return 'destructive';
      case 'reserved':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'آزاد';
      case 'occupied':
        return 'اشغال';
      case 'reserved':
        return 'رزرو';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center flex-row-reverse" dir="rtl">
        <div>
          <h2 className="text-2xl font-bold">مدیریت میزها</h2>
          <p className="text-muted-foreground">افزودن، ویرایش و حذف میزها</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) handleCloseDialog();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTable(null)}>
              <Plus className="w-4 h-4 ml-2" />
              افزودن میز جدید
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader dir="rtl">
              <DialogTitle>{editingTable ? 'ویرایش میز' : 'افزودن میز جدید'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tableNumber">شماره میز *</Label>
                  <Input
                    id="tableNumber"
                    type="number"
                    value={formData.tableNumber}
                    onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">ظرفیت (نفر) *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label>موقعیت روی نقشه (اختیاری)</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Input
                      placeholder="X"
                      type="number"
                      value={formData.positionX}
                      onChange={(e) => setFormData({ ...formData, positionX: e.target.value })}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Y"
                      type="number"
                      value={formData.positionY}
                      onChange={(e) => setFormData({ ...formData, positionY: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  لغو
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'در حال ذخیره...' : editingTable ? 'به‌روزرسانی' : 'افزودن'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" dir="rtl">
        {tables.map(table => (
          <Card key={table._id} dir="rtl">
            <CardHeader className="pb-3" dir="rtl">
              <div className="flex justify-between items-start flex-row-reverse" dir="rtl">
                <CardTitle className="text-lg">میز {table.tableNumber}</CardTitle>
                <Badge variant={getStatusColor(table.status)}>
                  {getStatusLabel(table.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent dir="rtl">
              <div className="space-y-3" dir="rtl">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>ظرفیت: {table.capacity} نفر</span>
                </div>
                {table.position && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>موقعیت: ({table.position.x}, {table.position.y})</span>
                  </div>
                )}
                {table.qrCode && (
                  <div className="text-xs text-muted-foreground">
                    کد QR: {table.qrCode.substring(0, 20)}...
                  </div>
                )}
                <div className="flex gap-2 pt-2 justify-start">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(table);
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    ویرایش
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(table._id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <Card className="p-12 text-center" dir="rtl">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">هنوز میزی اضافه نشده</h3>
          <p className="text-muted-foreground">برای شروع، میز جدیدی اضافه کنید</p>
        </Card>
      )}
    </div>
  );
};
