import React, { ReactNode } from 'react';
import loadSession from '@/utils/session';
import UserLayout from '@/Components/userLayout';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = async ({ children }) => {
    const session = await loadSession()
    return <UserLayout session={session}>{children}</UserLayout>;
};

export default Layout;
