import React, { ReactNode } from 'react';
import AdminLayout from '@/Components/adminLayout';
import loadSession from '@/utils/session';
import { SessionDTO } from '../types';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = async ({ children }) => {
    const session = await loadSession() as SessionDTO | undefined;
    return <AdminLayout session={session}>{children}</AdminLayout>;
};

export default Layout;
