import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import EmojiPicker from '@/components/ui/emoji-picker';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  vibes: string[];
  available: boolean;
  pairings?: string[];
  addOns?: Array<{ name: string; price: number; emoji: string; category: 'flavor' | 'topping' | 'syrup' | 'milk' }>;
}

interface Vibe {
  _id: string;
  key: string;
  label: string;
  emoji?: string;
}

const categories = ['coffee', 'tea', 'pastry', 'cold', 'food', 'dessert'];

export const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [newAddOnName, setNewAddOnName] = useState('');
  const [newAddOnPrice, setNewAddOnPrice] = useState('');
  const [newAddOnEmoji, setNewAddOnEmoji] = useState('');
  const [newAddOnCategory, setNewAddOnCategory] = useState<'flavor' | 'topping' | 'syrup' | 'milk'>('milk');
  const [newVibeKey, setNewVibeKey] = useState('');
  const [newVibeLabel, setNewVibeLabel] = useState('');
  const [newVibeEmoji, setNewVibeEmoji] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'coffee',
    image: '',
    vibes: [] as string[],
    available: true,
    pairings: [] as string[],
    addOns: [] as MenuItem['addOns'],
  });

  useEffect(() => {
    fetchMenuItems();
    fetchVibes();
  }, []);

  const fetchVibes = async () => {
    try {
      const { data } = await apiClient.get('/vibes');
      const fetchedVibes = data.data || [];
      
      // Seed initial vibes if none exist
      if (fetchedVibes.length === 0) {
        await seedInitialVibes();
        const { data: newData } = await apiClient.get('/vibes');
        setVibes(newData.data || []);
      } else {
        setVibes(fetchedVibes);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: error.response?.data?.error || 'خطا در دریافت vibes',
      });
    }
  };

  const seedInitialVibes = async () => {
    const initialVibes = [
      { key: 'energy', label: 'انرژی‌بخش', emoji: '⚡' },
      { key: 'relaxing', label: 'آرام‌بخش', emoji: '🧘' },
      { key: 'hungry', label: 'خوراکی', emoji: '🥐' },
      { key: 'cold-drink', label: 'نوشیدنی سرد', emoji: '❄️' },
    ];

    try {
      for (const vibe of initialVibes) {
        await apiClient.post('/vibes', vibe).catch(() => {});
      }
    } catch (error) {
      console.error('Error seeding vibes:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await apiClient.get('/menu');
      const items = data.data as MenuItem[];
      console.log('🔍 Fetched menu items:', items); // DEBUG
      console.log('🔍 Espresso items:', items.filter(i => i.name.includes('espresso') || i.name.includes('اسپرسو'))); // DEBUG
      // Auto-migrate common add-ons for existing items, then set updated list
      const finalItems = await migrateCommonAddOns(items);
      console.log('✅ After migration:', finalItems); // DEBUG
      console.log('✅ Espresso after migration:', finalItems.filter(i => i.name.includes('espresso') || i.name.includes('اسپرسو'))); // DEBUG
      setMenuItems(finalItems);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: error.response?.data?.error || 'خطا در دریافت منو',
      });
    }
  };

  // Migration: Attach typical add-ons (oat/almond milk) to espresso/coffee drinks if missing
  const migrateCommonAddOns = async (items: MenuItem[]): Promise<MenuItem[]> => {
    const needsMilkAddOns = (item: MenuItem) => {
      const name = (item.name || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const isCoffee = cat === 'coffee' || name.includes('espresso') || name.includes('اسپرسو');
      const existing = Array.isArray(item.addOns) ? item.addOns : [];
      const hasOat = existing.some(a => a.category === 'milk' && a.name.toLowerCase().includes('oat'));
      const hasAlmond = existing.some(a => a.category === 'milk' && a.name.toLowerCase().includes('almond'));
      return isCoffee && !(hasOat && hasAlmond);
    };

    const needsSyrups = (item: MenuItem) => {
      const name = (item.name || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const isLatteOrCold = name.includes('latte') || name.includes('لته') || name.includes('cappuccino') || name.includes('کاپوچینو') || name.includes('mocha') || name.includes('موکا') || name.includes('cold brew') || cat === 'cold';
      const existing = Array.isArray(item.addOns) ? item.addOns : [];
      const hasVanilla = existing.some(a => a.category === 'syrup' && (a.name.toLowerCase().includes('vanilla') || a.name.toLowerCase().includes('وانیلی')));
      const hasCaramel = existing.some(a => a.category === 'syrup' && (a.name.toLowerCase().includes('caramel') || a.name.toLowerCase().includes('کارامل')));
      return isLatteOrCold && !(hasVanilla && hasCaramel);
    };

    const needsToppings = (item: MenuItem) => {
      const name = (item.name || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const isDessertish = cat === 'dessert' || name.includes('cake') || name.includes('کیک');
      const existing = Array.isArray(item.addOns) ? item.addOns : [];
      const hasChoco = existing.some(a => a.category === 'topping' && a.name.toLowerCase().includes('chocolate'));
      return isDessertish && !hasChoco;
    };

    const patches: Array<{ id: string; addOns: NonNullable<MenuItem['addOns']> }> = [];
    for (const item of items) {
      const existing = Array.isArray(item.addOns) ? item.addOns : [];
      let next: NonNullable<MenuItem['addOns']> = [...existing];
      const lowerNames = existing.map(a => a.name.toLowerCase());
      let needsPatch = false;

      // Add milk if needed
      if (needsMilkAddOns(item)) {
        if (!lowerNames.includes('oat milk') && !lowerNames.includes('شیر جو')) {
          next.push({ name: 'شیر جو', price: 20000, emoji: '🌾', category: 'milk' });
          needsPatch = true;
        }
        if (!lowerNames.includes('almond milk') && !lowerNames.includes('شیر بادام')) {
          next.push({ name: 'شیر بادام', price: 20000, emoji: '🌰', category: 'milk' });
          needsPatch = true;
        }
      }

      // Add syrups if needed
      if (needsSyrups(item)) {
        if (!lowerNames.includes('vanilla') && !lowerNames.includes('وانیلی')) {
          next.push({ name: 'وانیلی', price: 10000, emoji: '🍮', category: 'syrup' });
          needsPatch = true;
        }
        if (!lowerNames.includes('caramel') && !lowerNames.includes('کارامل')) {
          next.push({ name: 'کارامل', price: 12000, emoji: '🍯', category: 'syrup' });
          needsPatch = true;
        }
        if (!lowerNames.includes('hazelnut') && !lowerNames.includes('فندق')) {
          next.push({ name: 'فندق', price: 12000, emoji: '🥜', category: 'syrup' });
          needsPatch = true;
        }
      }

      // Add toppings if needed
      if (needsToppings(item)) {
        if (!lowerNames.includes('chocolate') && !lowerNames.includes('شکلات')) {
          next.push({ name: 'شکلات', price: 8000, emoji: '🍫', category: 'topping' });
          needsPatch = true;
        }
        if (!lowerNames.includes('whipped cream') && !lowerNames.includes('خامه')) {
          next.push({ name: 'خامه', price: 8000, emoji: '🍮', category: 'topping' });
          needsPatch = true;
        }
      }

      // Only add one patch per item with all combined add-ons
      if (needsPatch) {
        patches.push({ id: item._id, addOns: next });
      }
    }
    console.log(`📋 Total patches to apply: ${patches.length}`); // DEBUG

    for (const p of patches) {
      try {
        console.log(`🔧 Patching item ${p.id} with addOns:`, p.addOns); // DEBUG
        await apiClient.patch(`/menu/${p.id}`, { addOns: p.addOns });
        console.log(`✅ Patched item ${p.id}`); // DEBUG
      } catch (e) {
        console.error(`❌ Failed to patch item ${p.id}:`, e); // DEBUG
      }
    }

    if (patches.length > 0) {
      try {
        console.log(`🔄 Refetching menu after ${patches.length} patches...`); // DEBUG
        const { data } = await apiClient.get('/menu');
        const refetchedItems = data.data as MenuItem[];
        console.log(`✅ Refetched menu with ${refetchedItems.length} items`); // DEBUG
        return refetchedItems;
      } catch (_) {
        console.error('❌ Failed to refetch menu'); // DEBUG
        return items;
      }
    }
    return items;
  };

  const addVibeInline = async () => {
    if (!newVibeKey.trim() || !newVibeLabel.trim()) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'لطفاً شناسه و نام vibe را وارد کنید',
      });
      return;
    }

    try {
      const { data } = await apiClient.post('/vibes', {
        key: newVibeKey.trim(),
        label: newVibeLabel.trim(),
        emoji: newVibeEmoji || undefined,
      });
      setVibes(prev => [...prev, data.data]);
      setNewVibeKey('');
      setNewVibeLabel('');
      setNewVibeEmoji('');
      toast({ title: '✅ Vibe جدید اضافه شد' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: error.response?.data?.error || 'خطا در ایجاد vibe',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        // ensure pairings are unique and not empty strings
        pairings: (formData.pairings || []).filter(Boolean),
        addOns: formData.addOns || [],
      };

      if (editingItem) {
        await apiClient.patch(`/menu/${editingItem._id}`, payload);
        toast({ title: '✅ آیتم به‌روزرسانی شد' });
      } else {
        await apiClient.post('/menu', payload);
        toast({ title: '✅ آیتم جدید اضافه شد' });
      }

      await fetchMenuItems();
      handleCloseDialog();
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.error || 'خطا در ذخیره آیتم';
      
      if (status === 401 || status === 403) {
        toast({
          variant: 'destructive',
          title: 'خطای احراز هویت',
          description: 'نشست شما منقضی شده است. لطفاً صفحه را رفرش کنید یا دوباره وارد شوید.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'خطا',
          description: message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;

    try {
      await apiClient.delete(`/menu/${id}`);
      toast({ title: '🗑️ آیتم حذف شد' });
      await fetchMenuItems();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: error.response?.data?.error || 'خطا در حذف آیتم',
      });
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image || '',
      vibes: item.vibes,
      available: item.available,
      pairings: item.pairings || [],
      addOns: item.addOns || [],
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'coffee',
      image: '',
      vibes: [],
      available: true,
      pairings: [],
      addOns: [],
    });
  };

  const addAddOnInline = () => {
    const name = newAddOnName.trim();
    const price = Math.max(0, parseInt(newAddOnPrice || '0', 10) || 0);
    const emoji = newAddOnEmoji || '✨';
    if (!name) return;
    setFormData(prev => ({
      ...prev,
      addOns: [ ...(prev.addOns || []), { name, price, emoji, category: newAddOnCategory } ]
    }));
    setNewAddOnName('');
    setNewAddOnPrice('');
    setNewAddOnEmoji('');
  };

  const toggleVibe = (vibe: string) => {
    setFormData(prev => ({
      ...prev,
      vibes: prev.vibes.includes(vibe)
        ? prev.vibes.filter(v => v !== vibe)
        : [...prev.vibes, vibe],
    }));
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center flex-row-reverse" dir="rtl">
        <div>
          <h2 className="text-2xl font-bold">مدیریت منو</h2>
          <p className="text-muted-foreground">افزودن، ویرایش و حذف آیتم‌های منو</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) handleCloseDialog();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingItem(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                category: 'coffee',
                image: '',
                vibes: [],
                available: true,
                pairings: [],
                addOns: [],
              });
              setNewAddOnName('');
              setNewAddOnPrice('');
              setNewAddOnEmoji('');
              setNewAddOnCategory('milk');
            }}>
              <Plus className="w-4 h-4 ml-2" />
              افزودن آیتم جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader dir="rtl">
              <DialogTitle>{editingItem ? 'ویرایش آیتم' : 'افزودن آیتم جدید'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">نام محصول *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">قیمت (تومان) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">دسته‌بندی</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <Switch
                    checked={formData.available}
                    onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                  />
                  <Label>در دسترس</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="image">آدرس تصویر (URL)</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label>Vibes (حداقل یکی)</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2">
                  <Input value={newVibeKey} onChange={(e) => setNewVibeKey(e.target.value)} placeholder="شناسه (key)" />
                  <Input value={newVibeLabel} onChange={(e) => setNewVibeLabel(e.target.value)} placeholder="نام نمایشی" />
                  <EmojiPicker value={newVibeEmoji} onChange={setNewVibeEmoji} />
                  <Button type="button" onClick={addVibeInline}>افزودن Vibe جدید</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {vibes.map(vibe => (
                    <Badge
                      key={vibe._id}
                      variant={formData.vibes.includes(vibe.key) ? 'default' : 'outline'}
                      className="cursor-pointer text-sm px-3 py-1.5"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          vibes: prev.vibes.includes(vibe.key)
                            ? prev.vibes.filter(v => v !== vibe.key)
                            : [...prev.vibes, vibe.key],
                        }));
                      }}
                    >
                      {vibe.emoji && <span className="mr-1">{vibe.emoji}</span>}
                      {vibe.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Add-ons per item – below vibes, above pairings */}
              <div>
                <Label>افزودنی‌های اختصاصی این آیتم</Label>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2">
                  <Input value={newAddOnName} onChange={(e) => setNewAddOnName(e.target.value)} placeholder="نام افزودنی" />
                  <Input value={newAddOnPrice} onChange={(e) => setNewAddOnPrice(e.target.value)} placeholder="قیمت (تومان)" inputMode="numeric" />
                  <EmojiPicker value={newAddOnEmoji} onChange={setNewAddOnEmoji} />
                  <Select value={newAddOnCategory} onValueChange={(v) => setNewAddOnCategory(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="دسته‌بندی" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="milk">شیر</SelectItem>
                      <SelectItem value="flavor">طعم</SelectItem>
                      <SelectItem value="topping">تاپینگ</SelectItem>
                      <SelectItem value="syrup">سیروپ</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addAddOnInline}>افزودن</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(formData.addOns || []).map((ao, idx) => (
                    <Badge key={idx} variant="outline" className={`text-xs flex items-center gap-2 cursor-pointer hover:opacity-75 ${
                      ao.category === 'milk' ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200' :
                      ao.category === 'flavor' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200' :
                      ao.category === 'topping' ? 'bg-sky-100 text-sky-900 dark:bg-sky-900/20 dark:text-sky-200' :
                      'bg-rose-100 text-rose-900 dark:bg-rose-900/20 dark:text-rose-200'
                    }`}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        addOns: prev.addOns?.filter((_, i) => i !== idx) || []
                      }));
                    }}>
                      <span className="text-lg">{ao.emoji}</span>
                      <span>{ao.name}</span>
                      <span className="text-muted-foreground">· {ao.price}ت</span>
                      <span className="font-bold">×</span>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>پیشنهادهای همراه (Pairings)</Label>
                <div className="mt-2 max-h-40 overflow-auto border rounded-lg p-2 space-y-2">
                  {menuItems
                    .filter(mi => !editingItem || mi._id !== editingItem._id)
                    .map(mi => {
                      const checked = formData.pairings.includes(mi._id);
                      return (
                        <label key={mi._id} className="flex items-center gap-3 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...formData.pairings, mi._id]
                                : formData.pairings.filter(id => id !== mi._id);
                              setFormData(prev => ({ ...prev, pairings: next }));
                            }}
                          />
                          <span className="flex-1">
                            {mi.name}
                            <span className="text-muted-foreground text-xs mr-2">{mi.category}</span>
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  لغو
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'در حال ذخیره...' : editingItem ? 'به‌روزرسانی' : 'افزودن'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="جستجو در منو..."
          className="pr-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
        {filteredItems.map(item => (
          <Card key={item._id} dir="rtl">
            <CardHeader className="pb-3" dir="rtl">
              <div className="flex justify-between items-start flex-row-reverse" dir="rtl">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{item.category}</Badge>
                    <Badge variant={item.available ? 'default' : 'destructive'}>
                      {item.available ? 'موجود' : 'ناموجود'}
                    </Badge>
                  </div>
                </div>
                {item.image && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent dir="rtl">
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {item.vibes.map(vibe => (
                  <Badge key={vibe} variant="outline" className="text-xs">{vibe}</Badge>
                ))}
              </div>
              <div className="flex justify-between items-center flex-row-reverse" dir="rtl">
                <span className="text-xl font-bold text-primary">{item.price.toLocaleString()} تومان</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(item._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">هنوز آیتمی اضافه نشده</h3>
          <p className="text-muted-foreground">برای شروع، آیتم جدیدی به منو اضافه کنید</p>
        </Card>
      )}
    </div>
  );
};
