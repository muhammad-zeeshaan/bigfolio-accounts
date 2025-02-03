'use client';
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, Space } from 'antd';
import { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import { redirect, usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { UserOutlined } from '@ant-design/icons';
import { SessionUser } from '@/app/types';

const { Header, Content, Footer } = Layout;

interface LayoutProps {
    children: ReactNode;
    session?: { user?: SessionUser };
}

const AdminLayout: React.FC<LayoutProps> = ({ children, session }) => {
    if (!session) {
        redirect('/signin');
    }
    const user = session.user;
    if (user?.role !== "admin" || !user) {
        redirect("/signin");
    }

    const pathname = usePathname(); // Get current path
    const router = useRouter();

    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        } else {
            setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
    }, []);

    const handleLogout = () => {
        signOut();
    };

    const handleAccount = () => {
        router.push('/account');
    };

    const menuItems = [
        { key: 'admin', label: 'Home', href: '/admin' },
        { key: 'calendar', label: 'Calendar', href: '/admin/calendar' },
        { key: 'history', label: 'History', href: '/admin/history' },
        { key: 'app', label: 'App', href: '/admin/app' },
    ];

    const breadcrumbItems = [
        { key: 'home', title: 'Home', href: '/admin' },
        { key: 'calendar', title: 'Calendar', href: '/admin/calendar' },
        { key: 'app', title: 'App', href: '/' },
    ];

    // Dropdown menu for user actions (Logout, My Account)
    const userMenu = (
        <Menu>
            <Menu.Item key="account" onClick={handleAccount}>
                My Account
            </Menu.Item>
            <Menu.Item key="logout" onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <ConfigProvider>
            <Layout>
                <Header style={{ position: 'fixed', width: '100%', zIndex: 99 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            selectedKeys={[pathname.split('/')[2] || 'admin']}
                            style={{ lineHeight: '64px' }}
                            items={menuItems}
                            onClick={(data) => {
                                const url = menuItems.find((item) => item.key === data.key)?.href ?? '';
                                router.push(url);
                            }}
                        />
                        <Dropdown overlay={userMenu} trigger={['click']}>
                            <a onClick={(e) => e.preventDefault()}>
                                <Space>
                                    <Avatar style={{ background: 'white', color: 'black' }} size={44} icon={<UserOutlined />} />
                                </Space>
                            </a>
                        </Dropdown>
                    </div>
                </Header>
                <Content style={{ padding: '0 50px', marginTop: 64 }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />
                    <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
                        {children}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Ant Design ©2016 Created by Ant UED
                </Footer>
            </Layout>
        </ConfigProvider>
    );
};

export default AdminLayout;
