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
import { Settings as SettingsIcon, User, Clock, Palette, Save, Loader2 } from "lucide-react";

const WEEKDAYS = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user: userInfo } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    firstName: userInfo?.first_name || "",
    lastName: userInfo?.last_name || "",
    email: userInfo?.email || "",
    monthlyGoal: userInfo?.monthly_goal?.toString() || "160",
    dailyGoal: userInfo?.daily_goal?.toString() || "8",
    workingDays: userInfo?.week_days_list || ["monday", "tuesday", "wednesday", "thursday", "friday"],
  });

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

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const changedData = getChangedData();
      
      if (Object.keys(changedData).length === 0) {
        toast({
          title: "No changes",
          description: "No changes to save.",
        });
        return;
      }

      await authService.updateUser(changedData);
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Customize your Chronos experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="chronos-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Profile</span>
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={settings.firstName}
                  onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={settings.lastName}
                  onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="chronos-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-primary" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize the look and feel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select 
                value={theme} 
                onValueChange={handleThemeChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose your preferred theme or follow system settings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Time Tracking Settings */}
        <Card className="chronos-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Time Tracking</span>
            </CardTitle>
            <CardDescription>
              Configure your tracking preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly-goal">Monthly Goal (hours)</Label>
                <Input
                  id="monthly-goal"
                  type="number"
                  value={settings.monthlyGoal}
                  onChange={(e) => setSettings({ ...settings, monthlyGoal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily-goal">Daily Goal (hours)</Label>
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
              <Label>Working Days</Label>
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
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}