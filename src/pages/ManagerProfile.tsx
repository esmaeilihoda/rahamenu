import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Shield, ArrowRight, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api';

const ManagerProfile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'خطا',
        description: 'نام نمی‌تواند خالی باشد',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data } = await apiClient.patch('/auth/profile', {
        name: formData.name,
      });

      // Update user in context
      if (updateUser) {
        updateUser(data.data);
      }

      toast({
        title: '✅ موفقیت',
        description: 'اطلاعات پروفایل با موفقیت به‌روزرسانی شد',
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update failed:', error);
      toast({
        title: 'خطا در به‌روزرسانی',
        description: error.response?.data?.error || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/manager')}
            className="mb-4"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            بازگشت به داشبورد
          </Button>
          <h1 className="text-3xl font-bold">اطلاعات پروفایل</h1>
          <p className="text-muted-foreground mt-2">
            مشاهده و ویرایش اطلاعات حساب کاربری
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات کاربری</CardTitle>
              <CardDescription>
                اطلاعات شخصی و دسترسی حساب کاربری شما
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  نام
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="نام خود را وارد کنید"
                    disabled={isSaving}
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{user?.name}</p>
                  </div>
                )}
              </div>

              {/* Email Field (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  ایمیل
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ایمیل قابل تغییر نیست
                  </p>
                </div>
              </div>

              {/* Role Field (Read-only) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  نقش
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">
                    {user?.role === 'admin'
                      ? 'مدیر کل'
                      : user?.role === 'manager'
                      ? 'مدیر'
                      : 'کارمند'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          در حال ذخیره...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 ml-2" />
                          ذخیره تغییرات
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                    >
                      انصراف
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    ویرایش اطلاعات
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Restaurant Info (if available) */}
        {user?.restaurantId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>اطلاعات رستوران</CardTitle>
                <CardDescription>رستورانی که در آن فعالیت می‌کنید</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">شناسه رستوران</p>
                  <p className="font-mono font-medium mt-1">{user.restaurantId}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ManagerProfile;
