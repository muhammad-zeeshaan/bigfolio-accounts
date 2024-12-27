import React, { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = async ({ children }) => {
    return <>{children}</>;
};

export default Layout;