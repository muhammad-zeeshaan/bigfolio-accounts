'use client';
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, Space } from 'antd';
import { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import { redirect, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { UserOutlined } from '@ant-design/icons';
import { SessionUser } from '@/app/types';
import Link from 'next/link';
import Image from 'next/image';

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
    const pathname = usePathname();
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

    const menuItems = [
        { key: 'home', label: 'Home', href: '/' },
        { key: 'admin', label: 'Employee', href: '/admin' },
        { key: 'history', label: 'History', href: '/admin/history' },
        { key: 'invoice', label: 'Invoice', href: '/admin/invoice' },
        { key: 'letter', label: 'Letter', href: '/admin/letter' },
    ];

    const generateBreadcrumbs = () => {
        const pathSegments = pathname.split('/').filter(Boolean);
        return pathSegments.map((segment, index) => {
            const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
            return { title: <Link href={url}>{segment.charAt(0).toUpperCase() + segment.slice(1)}</Link>, key: url };
        });
    };
    console.log(isDarkMode)
    const userMenu = (
        <Menu>
            <Menu.Item key="account">
                <Link href={"/admin/account"}>My Account</Link>
            </Menu.Item>
            <Menu.Item key="logout" onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    const activeKeys = () => {
        const activeItem = menuItems.find((item) => item.href === pathname);
        return activeItem ? [activeItem.key] : [];
    };

    return (
        <ConfigProvider>
            <Layout>
                <Header style={{ position: 'fixed', width: '100%', zIndex: 99 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {/* Logo */}
                            <Link href="/">
                                <Image src="/public/Bigfolio-logo.svg" width={30} height={40} alt="Logo" style={{ marginRight: 16 }} />
                            </Link>
                            <Menu
                                theme="dark"
                                mode="horizontal"
                                selectedKeys={activeKeys()}
                                style={{ lineHeight: '64px' }}
                            >
                                {menuItems.map((item) => (
                                    <Menu.Item key={item.key}>
                                        <Link href={item.href}>{item.label}</Link>
                                    </Menu.Item>
                                ))}
                            </Menu>
                        </div>
                        <Dropdown overlay={userMenu} trigger={['click']}>
                            <a onClick={(e) => e.preventDefault()}>
                                <Space>
                                    <Avatar style={{ background: 'white', color: 'black' }} size={44} icon={<UserOutlined />} />
                                </Space>
                            </a>
                        </Dropdown>
                    </div>
                </Header>
                <Content className="px-[2px] md:px-12 pt-8 md:pt-16">
                    <Breadcrumb className="!my-4" items={generateBreadcrumbs()} />
                    <div className="p-4 sm:p-6  min-h-screen">
                        {children}
                    </div>
                </Content>
                {/* <Content style={{ padding: '0 50px', marginTop: 64 }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={generateBreadcrumbs()} />
                    <div style={{ padding: 24, minHeight: 380 }}>
                        {children}
                    </div>
                </Content> */}
                <Footer style={{ textAlign: 'center' }}>
                    Bigfolio accounts ©2025 Created by Bigfolio LLC
                </Footer>
            </Layout>
        </ConfigProvider>
    );
};

export default AdminLayout;
