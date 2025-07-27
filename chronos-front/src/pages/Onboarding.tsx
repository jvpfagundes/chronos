import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Clock, Target, Calendar, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const WEEKDAYS = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export default function Onboarding() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    monthlyGoal: "",
    dailyHours: "",
    workingDays: [] as string[],
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

  const { toast } = useToast();
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const handleWorkingDayChange = (dayId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        workingDays: [...formData.workingDays, dayId],
      });
    } else {
      setFormData({
        ...formData,
        workingDays: formData.workingDays.filter((id) => id !== dayId),
      });
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    
    try {
      await completeOnboarding({
        monthly_goal: parseInt(formData.monthlyGoal),
        daily_goal: parseFloat(formData.dailyHours),
        week_days_list: formData.workingDays,
      });

      toast({
        title: t('onboarding.welcomeToastTitle'),
        description: t('onboarding.welcomeToastDescription'),
      });


      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {

      

      const errorMessage = error instanceof Error ? error.message : t('onboarding.errorToastDescription');
      
      toast({
        title: t('onboarding.errorToastTitle'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.monthlyGoal.trim() !== "";
      case 2:
        return formData.dailyHours.trim() !== "";
      case 3:
        return formData.workingDays.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center space-x-2 mb-6 md:mb-8">
            <img 
              src="/assets/logo_chronos.png" 
              alt="Chronos Logo" 
              className="h-12 w-12 md:h-16 md:w-16"
            />
            <img 
              src="/assets/logo_chronos_text.png" 
              alt="Chronos" 
              className="h-10 md:h-12"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
            {t('onboarding.setupWorkspaceTitle')}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {t('onboarding.setupWorkspaceDescription')}
          </p>
          
          {/* Progress Bar */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    stepNumber <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <Card className="chronos-card">
          <CardHeader>
            <div className="flex items-center space-x-3">
              {step === 1 && <Target className="h-6 w-6 text-primary" />}
              {step === 2 && <Clock className="h-6 w-6 text-primary" />}
              {step === 3 && <Calendar className="h-6 w-6 text-primary" />}
              <div>
                <CardTitle>
                  {step === 1 && t('onboarding.monthlyGoalTitle')}
                  {step === 2 && t('onboarding.dailyHoursTitle')}
                  {step === 3 && t('onboarding.workingDaysTitle')}
                </CardTitle>
                <CardDescription>
                  {step === 1 && t('onboarding.monthlyGoalDescription')}
                  {step === 2 && t('onboarding.dailyHoursDescription')}
                  {step === 3 && t('onboarding.workingDaysDescription')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly-goal">{t('onboarding.monthlyGoalLabel')}</Label>
                  <Input
                    id="monthly-goal"
                    type="number"
                    placeholder={t('onboarding.monthlyGoalPlaceholder')}
                    value={formData.monthlyGoal}
                    onChange={(e) => setFormData({ ...formData, monthlyGoal: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    {t('onboarding.monthlyGoalHelpText')}
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="daily-hours">{t('onboarding.dailyHoursLabel')}</Label>
                  <Input
                    id="daily-hours"
                    type="number"
                    step="0.5"
                    placeholder={t('onboarding.dailyHoursPlaceholder')}
                    value={formData.dailyHours}
                    onChange={(e) => setFormData({ ...formData, dailyHours: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    {t('onboarding.dailyHoursHelpText')}
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <Label>{t('onboarding.workingDaysLabel')}</Label>
                <div className="grid grid-cols-2 gap-4">
                  {WEEKDAYS.map((day) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.id}
                        checked={formData.workingDays.includes(day.id)}
                        onCheckedChange={(checked) => 
                          handleWorkingDayChange(day.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={day.id}>{day.label}</Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('onboarding.workingDaysHelpText')}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                {t('onboarding.backButton')}
              </Button>
              
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="chronos-button-primary"
                >
                  {t('onboarding.nextButton')}
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={!isStepValid() || isSubmitting}
                  className="chronos-button-primary"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('onboarding.settingUpButton')}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {t('onboarding.finishButton')}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}