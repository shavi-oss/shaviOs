import { redirect } from 'next/navigation';
import { getSession, hasRole } from '@/lib/auth';

export default async function TechPanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Get server-side session
    const session = await getSession();

    // 2. Security Check: Must be admin or developer
    if (!session || !session.user || !hasRole(session.user, ['admin', 'developer'])) {
        redirect('/'); // Or a dedicated /unauthorized page
    }

    // 3. Render children if authorized
    return (
        <div className="h-full w-full">
           {children}
        </div>
    );
}
