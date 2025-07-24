import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const navigate = useNavigate();
  const { login, register, loading, isFirstAccess } = useAuth();
  const { toast } = useToast();

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
      toast({
        title: "Success!",
        description: "Login successful.",
      });
      navigate(isFirstAccess ? "/onboarding" : "/dashboard");
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
      await register(registerData);
      toast({
        title: "Success!",
        description: "Account created successfully. You have been logged in automatically.",
      });
      navigate(isFirstAccess ? "/onboarding" : "/dashboard");
    } catch (error) {
      toast({
        title: "Registration Error",
        description: error instanceof Error ? error.message : "Unexpected error.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray950 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-6">
            <img 
              src="/assets/logo_chronos.png" 
              alt="Chronos Logo" 
              className="h-16 w-16"
            />
            <img 
              src="/assets/logo_chronos_text.png"
              alt="Chronos" 
              className="h-20"
            />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome to Chronos
          </h2>
          <p className="text-muted-foreground mt-2">
            Track your time with precision and clarity
          </p>
        </div>

        {/* Auth Tabs */}
        <Card className="chronos-card">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Sign in to your account</CardTitle>
                <CardDescription>
                  Enter your credentials to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Email or Username</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your email or username"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="text-right">
                    <Button variant="link" className="p-0 h-auto text-sm text-primary">
                      Forgot password?
                    </Button>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full chronos-button-primary"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="signup">
              <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>
                  Join Chronos and start tracking your time efficiently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-first-name">First Name</Label>
                      <Input
                        id="signup-first-name"
                        type="text"
                        placeholder="Your first name"
                        value={signUpData.first_name}
                        onChange={(e) => setSignUpData({ ...signUpData, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-last-name">Last Name</Label>
                      <Input
                        id="signup-last-name"
                        type="text"
                        placeholder="Your last name"
                        value={signUpData.last_name}
                        onChange={(e) => setSignUpData({ ...signUpData, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Your email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-birth-date">Birth Date</Label>
                    <Input
                      id="signup-birth-date"
                      type="date"
                      value={signUpData.birth_date}
                      onChange={(e) => setSignUpData({ ...signUpData, birth_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
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
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}