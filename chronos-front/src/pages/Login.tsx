import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

export default function Login() {
  const navigate = useNavigate();
  const { login, register, loading, isFirstAccess } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  
  const [signUpData, setSignUpData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    birth_date: "",
    password: "",
    confirmPassword: "",
  });

  const [birthDate, setBirthDate] = useState<Date | undefined>();

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await login(loginData);
      

      if (isFirstAccess) {
        toast({
          title: "Success!",
          description: "Login successful. Redirecting to onboarding...",
        });
        navigate("/onboarding");
      } else {
        toast({
          title: "Success!",
          description: "Login successful. Redirecting to dashboard...",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: error instanceof Error ? error.message : "Unexpected error.",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match.",
        variant: "destructive",
      });
      return;
    }

    if (!signUpData.first_name || !signUpData.last_name || !signUpData.email || !signUpData.birth_date || !signUpData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { confirmPassword, ...registerData } = signUpData;
      await register({
        ...registerData,
        birth_date: birthDate ? format(birthDate, "yyyy-MM-dd") : "",
      });
      

      if (isFirstAccess) {
        toast({
          title: "Success!",
          description: "Account created successfully. Redirecting to onboarding...",
        });
        navigate("/onboarding");
      } else {
        toast({
          title: "Success!",
          description: "Account created successfully. Redirecting to dashboard...",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: error instanceof Error ? error.message : "Unexpected error.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="absolute top-4 right-4 z-10">
        <Select onValueChange={handleLanguageChange} defaultValue={i18n.language}>
          <SelectTrigger className="w-fit">
            <SelectValue>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{i18n.language.toUpperCase()}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="pt">Português</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden lg:flex items-center justify-center bg-primary-light/30 p-8 relative">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center space-x-1 mb-4 md:mb-6">
            <img 
              src="/assets/logo_chronos.png" 
              alt="Chronos Logo" 
              className="h-12 w-12 md:h-16 md:w-16"
            />
            <img 
              src="/assets/logo_chronos_text.png"
              alt="Chronos" 
              className="h-16 md:h-20"
            />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            {t("login.welcomeTitle")}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            {t("login.welcomeDescription")}
          </p>
        </div>
      </div>
      
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md space-y-6 md:space-y-8">
          <div className="text-center lg:hidden">
            <div className="flex items-center justify-center space-x-1 mb-4 md:mb-6">
              <img 
                src="/assets/logo_chronos.png" 
                alt="Chronos Logo" 
                className="h-12 w-12 md:h-16 md:w-16"
              />
              <img 
                src="/assets/logo_chronos_text.png"
                alt="Chronos" 
                className="h-16 md:h-20"
              />
            </div>
          </div>

          <Card className="chronos-card">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("login.signIn")}</TabsTrigger>
                <TabsTrigger value="signup">{t("login.signUp")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <CardHeader>
                  <CardTitle>{t("login.signInTitle")}</CardTitle>
                  <CardDescription>
                    {t("login.signInDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">{t("login.emailOrUsernameLabel")}</Label>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder={t("login.enterEmailOrUsernamePlaceholder")}
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t("login.passwordLabel")}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder={t("login.enterPasswordPlaceholder")}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full chronos-button-primary"
                      disabled={loading}
                    >
                      {loading ? t("login.signingIn") : t("login.signInButton")}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="signup">
                <CardHeader>
                  <CardTitle>{t("login.createAccountTitle")}</CardTitle>
                  <CardDescription>
                    {t("login.createAccountDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-first-name">{t("login.firstNameLabel")}</Label>
                        <Input
                          id="signup-first-name"
                          type="text"
                          placeholder={t("login.yourFirstNamePlaceholder")}
                          value={signUpData.first_name}
                          onChange={(e) => setSignUpData({ ...signUpData, first_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-last-name">{t("login.lastNameLabel")}</Label>
                        <Input
                          id="signup-last-name"
                          type="text"
                          placeholder={t("login.yourLastNamePlaceholder")}
                          value={signUpData.last_name}
                          onChange={(e) => setSignUpData({ ...signUpData, last_name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t("login.emailLabel")}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t("login.yourEmailPlaceholder")}
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-birth-date">{t("login.birthDateLabel")}</Label>
                      <DatePicker
                        date={birthDate}
                        setDate={setBirthDate}
                        placeholder={t('login.birthDatePlaceholder', 'Select your birth date')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t("login.createPasswordLabel")}</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder={t("login.createPasswordPlaceholder")}
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{t("login.confirmPasswordLabel")}</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder={t("login.confirmPasswordPlaceholder")}
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full chronos-button-primary"
                      disabled={loading}
                    >
                      {loading ? t("login.creatingAccount") : t("login.createAccountButton")}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}