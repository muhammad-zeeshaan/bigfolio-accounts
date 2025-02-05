import React, { ReactNode } from 'react';
import { redirect } from "next/navigation"
import loadSession from '@/utils/session';
import { SessionUser } from '../types';
interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = async ({ children }) => {
    const session = await loadSession()
    if (session) {
        const currentUser = session?.user as SessionUser
        return currentUser?.role === "admin" ? redirect('/admin') : redirect('/calendar')

    }
    return <>{children}</>;
};

export default Layout;