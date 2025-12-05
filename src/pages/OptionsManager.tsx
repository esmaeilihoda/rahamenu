import React, { useState } from 'react';
import { useOptions, MilkType } from '@/context/OptionsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import EmojiPicker from '@/components/ui/emoji-picker';

const persianMilk: Record<MilkType, string> = {
  dairy: 'شیر معمولی',
  oat: 'شیر جو دوسر',
  almond: 'شیر بادام',
};

export default function OptionsManager() {
  const { config, updateConfig } = useOptions();
  const [localMilk, setLocalMilk] = useState<Record<MilkType, string>>({
    dairy: String(config.milkSurcharges.dairy),
    oat: String(config.milkSurcharges.oat),
    almond: String(config.milkSurcharges.almond),
  });
  const [addOnName, setAddOnName] = useState('');
  const [addOnPrice, setAddOnPrice] = useState('');
  const [addOnEmoji, setAddOnEmoji] = useState('');

  const saveMilk = () => {
    const parsed: Record<MilkType, number> = {
      dairy: Math.max(0, parseInt(localMilk.dairy || '0', 10) || 0),
      oat: Math.max(0, parseInt(localMilk.oat || '0', 10) || 0),
      almond: Math.max(0, parseInt(localMilk.almond || '0', 10) || 0),
    };
    updateConfig((prev) => ({ ...prev, milkSurcharges: parsed }));
  };

  const addAddOn = () => {
    const name = addOnName.trim();
    const price = Math.max(0, parseInt(addOnPrice || '0', 10) || 0);
    const emoji = addOnEmoji.trim() || '✨';
    if (!name) return;
    updateConfig((prev) => ({
      ...prev,
      addOns: { ...prev.addOns, [name]: { price, emoji } },
    }));
    setAddOnName('');
    setAddOnPrice('');
    setAddOnEmoji('');
  };

  const removeAddOn = (name: string) => {
    updateConfig((prev) => {
      const next = { ...prev.addOns };
      delete next[name];
      return { ...prev, addOns: next };
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>تنظیم قیمت شیرها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(persianMilk) as MilkType[]).map((milk) => (
            <div key={milk} className="grid grid-cols-1 md:grid-cols-3 items-center gap-3">
              <Label>{persianMilk[milk]}</Label>
              <Input
                value={localMilk[milk]}
                onChange={(e) => setLocalMilk((s) => ({ ...s, [milk]: e.target.value }))}
                placeholder="قیمت افزوده (تومان)"
                inputMode="numeric"
              />
              <Badge variant="secondary">فعلی: {config.milkSurcharges[milk]} تومان</Badge>
            </div>
          ))}
          <div className="flex justify-end">
            <Button onClick={saveMilk}>ذخیره قیمت شیر</Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>افزودنی‌ها و قیمت</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-3">
            <Input value={addOnName} onChange={(e) => setAddOnName(e.target.value)} placeholder="نام افزودنی" />
            <Input value={addOnPrice} onChange={(e) => setAddOnPrice(e.target.value)} placeholder="قیمت (تومان)" inputMode="numeric" />
            <EmojiPicker value={addOnEmoji} onChange={setAddOnEmoji} />
            <Button onClick={addAddOn}>افزودن افزودنی</Button>
          </div>
          <div className="space-y-2">
            {Object.entries(config.addOns).length === 0 ? (
              <p className="text-muted-foreground">افزودنی تعریف نشده است.</p>
            ) : (
              Object.entries(config.addOns).map(([name, meta]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="text-lg">{meta.emoji}</span> {name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{meta.price} تومان</Badge>
                    <Button variant="destructive" size="sm" onClick={() => removeAddOn(name)}>حذف</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
