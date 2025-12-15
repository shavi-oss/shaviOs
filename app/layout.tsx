import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NotificationProvider } from "@/contexts/notification-context";
import { AuthProvider } from "@/contexts/auth-context";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});


export const metadata: Metadata = {
    title: "Shavi Academy OS",
    description: "Integrated Academic Management System",
    manifest: "/manifest.json",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning data-scroll-behavior="smooth">
            <body
                className={`${inter.variable} font-sans antialiased`}
                suppressHydrationWarning
            >
                <ThemeProvider>
                    <NotificationProvider>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </NotificationProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
