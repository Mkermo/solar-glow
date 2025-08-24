import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

const signupSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email({
      message: "Please enter a valid email address",
    }),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      setIsLoading(true);
      const { success, error } = await signUp(data.email, data.password);
      
      if (success) {
        toast({
          title: t("Success", "نجاح"),
          description: t("Account created successfully", "تم إنشاء الحساب بنجاح")
        });
        navigate('/login');
      } else {
        throw error;
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("Error", "خطأ"),
        description: error.message || t("Failed to create account", "فشل إنشاء الحساب")
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
            {t("Create an account", "إنشاء حساب")}
          </CardTitle>
          <CardDescription>
            {t("Enter your email and password to create your account", "أدخل بريدك الإلكتروني وكلمة المرور لإنشاء حسابك")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Email", "البريد الإلكتروني")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Password", "كلمة المرور")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Confirm Password", "تأكيد كلمة المرور")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Creating account...", "جاري إنشاء الحساب...")}
                  </>
                ) : (
                  t("Create account", "إنشاء حساب")
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground">
            {t("Already have an account?", "لديك حساب بالفعل؟")}{" "}
            <Link to="/login" className="text-primary hover:underline">
              {t("Sign in", "تسجيل الدخول")}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
