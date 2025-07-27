import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/layout/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/lib/auth-service";
import { Settings as SettingsIcon, User, Clock, Palette, Save, Loader2, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user: userInfo, updateUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    firstName: userInfo?.first_name || "",
    lastName: userInfo?.last_name || "",
    email: userInfo?.email || "",
    monthlyGoal: userInfo?.monthly_goal?.toString() || "160",
    dailyGoal: userInfo?.daily_goal?.toString() || "8",
    workingDays: userInfo?.week_days_list || ["monday", "tuesday", "wednesday", "thursday", "friday"],
  });

  const WEEKDAYS = [
    { id: "monday", label: t('weekdays.monday') },
    { id: "tuesday", label: t('weekdays.tuesday') },
    { id: "wednesday", label: t('weekdays.wednesday') },
    { id: "thursday", label: t('weekdays.thursday') },
    { id: "friday", label: t('weekdays.friday') },
    { id: "saturday", label: t('weekdays.saturday') },
    { id: "sunday", label: t('weekdays.sunday') },
  ];

  useEffect(() => {
    if (userInfo) {
      setSettings({
        firstName: userInfo.first_name || "",
        lastName: userInfo.last_name || "",
        email: userInfo.email || "",
        monthlyGoal: userInfo.monthly_goal?.toString() || "160",
        dailyGoal: userInfo.daily_goal?.toString() || "8",
        workingDays: userInfo.week_days_list || ["monday", "tuesday", "wednesday", "thursday", "friday"],
      });
    }
  }, [userInfo]);

  const getChangedData = () => {
    if (!userInfo) return {};
    
    const changes: any = {};
    
    if (settings.firstName !== userInfo.first_name) {
      changes.first_name = settings.firstName;
    }
    
    if (settings.lastName !== userInfo.last_name) {
      changes.last_name = settings.lastName;
    }
    
    if (Number(settings.monthlyGoal) !== userInfo.monthly_goal) {
      changes.monthly_goal = Number(settings.monthlyGoal);
    }
    
    if (Number(settings.dailyGoal) !== userInfo.daily_goal) {
      changes.daily_goal = Number(settings.dailyGoal);
    }
    
    const currentWorkingDays = userInfo.week_days_list || [];
    const newWorkingDays = settings.workingDays;
    
    if (currentWorkingDays.length !== newWorkingDays.length || 
        !currentWorkingDays.every((day, index) => day === newWorkingDays[index])) {
      changes.week_days_list = newWorkingDays;
    }
    
    return changes;
  };

  const handleWorkingDayChange = (dayId: string, checked: boolean) => {
    if (checked) {
      setSettings({
        ...settings,
        workingDays: [...settings.workingDays, dayId],
      });
    } else {
      setSettings({
        ...settings,
        workingDays: settings.workingDays.filter((id) => id !== dayId),
      });
    }
  };

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  const handleLanguageChange = async (lng: 'en' | 'pt') => {
    try {
      await authService.updateUser({ language: lng });
      updateUser({ ...userInfo!, language: lng });
      i18n.changeLanguage(lng);
      toast({
        title: t('settings.languageChangedTitle', 'Language updated'),
        description: t('settings.languageChangedDescription', 'Your language preference has been saved.'),
      });
    } catch (error) {
      toast({
        title: t('settings.error'),
        description: error instanceof Error ? error.message : t('settings.errorDescription'),
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const changedData = getChangedData();
      
      if (Object.keys(changedData).length === 0) {
        toast({
          title: t('settings.noChanges'),
          description: t('settings.noChangesDescription'),
        });
        return;
      }

      await authService.updateUser(changedData);
      
      toast({
        title: t('settings.success'),
        description: t('settings.successDescription'),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('settings.errorDescription');
      toast({
        title: t('settings.error'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">{t('settings.title')}</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          {t('settings.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="chronos-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>{t('settings.profileTitle')}</span>
            </CardTitle>
            <CardDescription>
              {t('settings.profileDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('settings.firstNameLabel')}</Label>
                <Input
                  id="firstName"
                  value={settings.firstName}
                  onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('settings.lastNameLabel')}</Label>
                <Input
                  id="lastName"
                  value={settings.lastName}
                  onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('settings.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                {t('settings.emailCannotBeChanged')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="chronos-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-primary" />
              <span>{t('settings.appearanceTitle')}</span>
            </CardTitle>
            <CardDescription>
              {t('settings.appearanceDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('settings.themeLabel')}</Label>
              <Select 
                value={theme} 
                onValueChange={handleThemeChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
                  <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
                  <SelectItem value="system">{t('settings.themeSystem')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.themeDescription')}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>{t('settings.languageLabel', 'Language')}</Label>
              <Select onValueChange={(value) => handleLanguageChange(value as 'en' | 'pt')} defaultValue={i18n.language}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>{i18n.language === 'en' ? 'English' : 'Português'}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.languageDescription', 'Choose your preferred language')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Time Tracking Settings */}
        <Card className="chronos-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>{t('settings.timeTrackingTitle')}</span>
            </CardTitle>
            <CardDescription>
              {t('settings.timeTrackingDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly-goal">{t('settings.monthlyGoalLabel')}</Label>
                <Input
                  id="monthly-goal"
                  type="number"
                  value={settings.monthlyGoal}
                  onChange={(e) => setSettings({ ...settings, monthlyGoal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily-goal">{t('settings.dailyGoalLabel')}</Label>
                <Input
                  id="daily-goal"
                  type="number"
                  step="0.5"
                  value={settings.dailyGoal}
                  onChange={(e) => setSettings({ ...settings, dailyGoal: e.target.value })}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Label>{t('settings.workingDaysLabel')}</Label>
              <div className="grid grid-cols-2 gap-3">
                {WEEKDAYS.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.id}
                      checked={settings.workingDays.includes(day.id)}
                      onCheckedChange={(checked) => 
                        handleWorkingDayChange(day.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={day.id} className="text-sm">{day.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          className="chronos-button-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('settings.savingButton')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('settings.saveButton')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}