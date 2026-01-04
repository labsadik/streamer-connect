import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, User, Video, Info } from "lucide-react";
import ContentPolicy from "@/components/ContentPolicy";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false); // For mobile
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate("/");
    return null;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName },
        },
      });

      if (error) throw error;
      toast.success("Account created! Please check your email to confirm.");
      navigate("/");
    } catch (error: any) {
      console.error("Sign up error:", error);
      if (error.message?.includes("already registered")) {
        toast.error("This email is already registered. Try signing in.");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
      navigate("/");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      {/* Desktop: Side-by-side layout */}
      <div className="hidden lg:grid grid-cols-[1fr_300px] gap-8 w-full max-w-4xl">
        {/* Auth Card */}
        <div className="flex items-center justify-center">
          <AuthCard
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            fullName={fullName}
            setFullName={setFullName}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
            handleSignIn={handleSignIn}
            handleSignUp={handleSignUp}
          />
        </div>

        {/* Policy Panel - Desktop Only */}
        <div className="bg-card border rounded-lg p-6 sticky top-8 self-start">
          <ContentPolicy />
        </div>
      </div>

      {/* Mobile/Tablet: Policy toggle */}
      <div className="lg:hidden w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Video className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">NoorCast</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPolicy(!showPolicy)}
            aria-label="Content policy"
          >
            <Info className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        {showPolicy ? (
          <Card className="mb-6 border-border/50">
            <CardContent className="pt-4 pb-2">
              <ContentPolicy />
            </CardContent>
          </Card>
        ) : null}

        <AuthCard
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          fullName={fullName}
          setFullName={setFullName}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isLoading={isLoading}
          handleSignIn={handleSignIn}
          handleSignUp={handleSignUp}
        />
      </div>
    </div>
  );
}

// ✅ Extracted AuthCard for reuse
function AuthCard({
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  showPassword,
  setShowPassword,
  isLoading,
  handleSignIn,
  handleSignUp,
}: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  fullName: string;
  setFullName: (name: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isLoading: boolean;
  handleSignIn: (e: React.FormEvent) => Promise<void>;
  handleSignUp: (e: React.FormEvent) => Promise<void>;
}) {
  return (
    <Card className="w-full border border-border/50 shadow-lg">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-2xl font-semibold text-center">Welcome</CardTitle>
        <CardDescription className="text-center text-sm">
          Sign in or create an account
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-0">
            <form onSubmit={handleSignIn} className="space-y-4">
              <InputField
                id="signin-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4 text-muted-foreground" />}
              />
              <PasswordField
                id="signin-password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-0">
            <form onSubmit={handleSignUp} className="space-y-4">
              <InputField
                id="signup-name"
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<User className="h-4 w-4 text-muted-foreground" />}
              />
              <InputField
                id="signup-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4 text-muted-foreground" />}
              />
              <PasswordField
                id="signup-password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Reusable input with icon
function InputField({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  icon,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {icon}
        </div>
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pl-10"
          required
        />
      </div>
    </div>
  );
}

// Reusable password field
function PasswordField({
  id,
  label,
  value,
  onChange,
  showPassword,
  setShowPassword,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          className="pl-10 pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}