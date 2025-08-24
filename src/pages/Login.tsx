import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const { signIn, checkConnection } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check connection when component mounts or when coming back online
  useEffect(() => {
    if (isOnline) {
      testConnection();
    } else {
      setIsNetworkError(true);
      setError("Browser reports you're offline. Please check your internet connection.");
    }
  }, [isOnline]);

  const testConnection = useCallback(async () => {
    setCheckingConnection(true);
    try {
      const result = await checkConnection();
      console.log("Connection check result:", result);
      
      if (!result.connected) {
        if (result.isNetworkError) {
          setError("Network connectivity issue detected. Your browser can't reach the authentication service.");
          toast({
            variant: "destructive",
            title: "Network Connectivity Issue",
            description: "Unable to reach the authentication service. This could be due to network restrictions or service unavailability."
          });
        } else {
          setError("Authentication service is available but returned an error.");
          toast({
            variant: "destructive",
            title: "Authentication Service Issue",
            description: "The service is reachable but returned an error. Please try again later."
          });
        }
        setIsNetworkError(true);
      } else {
        setIsNetworkError(false);
        setError(null);
        toast({
          title: "Connection Successful",
          description: "Successfully connected to authentication service."
        });
      }
    } catch (err) {
      console.error("Connection test failed:", err);
      setError("Failed to test connection. Please try again.");
      setIsNetworkError(true);
    } finally {
      setCheckingConnection(false);
    }
  }, [checkConnection, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { success, error } = await signIn(email, password);
      
      if (success) {
        toast({
          title: t("Success", "نجاح"),
          description: t("Logged in successfully", "تم تسجيل الدخول بنجاح"),
        });
        navigate('/', { replace: true });
      } else {
        throw error;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: t("Error", "خطأ"),
        description: error.message || t("Failed to login", "فشل تسجيل الدخول"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {t("Sign in", "تسجيل الدخول")}
          </CardTitle>
          <CardDescription>
            {t("Enter your email and password to sign in", "أدخل بريدك الإلكتروني وكلمة المرور لتسجيل الدخول")}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("Email", "البريد الإلكتروني")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@example.com"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("Password", "كلمة المرور")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Signing in...", "جاري تسجيل الدخول...")}
                </>
              ) : (
                t("Sign in", "تسجيل الدخول")
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {t("Don't have an account?", "ليس لديك حساب؟")}{" "}
              <Link to="/signup" className="text-primary hover:underline">
                {t("Sign up", "التسجيل")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
