"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Sign in with Supabase
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message || "فشل تسجيل الدخول");
                setIsLoading(false);
                return;
            }

            // Success! Redirect to dashboard
            router.push("/");
            router.refresh();
        } catch (err) {
            setError("حدث خطأ أثناء تسجيل الدخول");
            setIsLoading(false);
        }
    };

    const demoAccounts = [
        { email: "admin@shavi.com", password: "admin123", role: "مدير النظام" },
        { email: "sales@shavi.com", password: "sales123", role: "قسم المبيعات" },
        { email: "marketing@shavi.com", password: "marketing123", role: "قسم التسويق" },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-3 text-center">
                    <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Shavi Academy OS</CardTitle>
                    <CardDescription className="text-base">
                        نظام إدارة أكاديمي متكامل
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                البريد الإلكتروني
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@shavi.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                كلمة المرور
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                        </Button>
                    </form>

                    {/* Demo Accounts */}
                    <div className="mt-6 pt-6 border-t">
                        <p className="text-sm text-muted-foreground text-center mb-3">
                            حسابات تجريبية للاختبار:
                        </p>
                        <div className="space-y-2">
                            {demoAccounts.map((account, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                        setEmail(account.email);
                                        setPassword(account.password);
                                    }}
                                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors text-sm"
                                >
                                    <div className="font-medium">{account.role}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {account.email}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
