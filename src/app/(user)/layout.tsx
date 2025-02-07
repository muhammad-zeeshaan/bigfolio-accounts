import React, { ReactNode } from 'react';
import loadSession from '@/utils/session';
import UserLayout from '@/Components/userLayout';
import { SessionDTO } from '../types';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = async ({ children }) => {
    const session = await loadSession()
    return <UserLayout session={session as SessionDTO}>{children}</UserLayout>;
};

export default Layout;
