import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar userRole={session.user.role} />

            {/* Main Content */}
            <div className="lg:mr-64">
                <Header user={session.user} />
                <main className="min-h-[calc(100vh-73px)]">{children}</main>
            </div>
        </div>
    );
}
