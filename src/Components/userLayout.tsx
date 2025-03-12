'use client';
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, Space } from 'antd';
import { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import { redirect, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { UserOutlined } from '@ant-design/icons';
import { SessionDTO } from '@/app/types';
import Link from 'next/link';

const { Header, Content, Footer } = Layout;

interface LayoutProps {
    children: ReactNode;
    session?: SessionDTO;
}

const UserLayout: React.FC<LayoutProps> = ({ children, session }) => {
    if (!session) {
        redirect('/signin');
    }
    const [isDarkMode, setIsDarkMode] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsDarkMode(false);
    }, []);
    console.log(isDarkMode)
    const handleLogout = () => {
        signOut();
    };

    const menuItems = [
        { key: 'calendar', label: 'Calendar', href: '/calendar' },
        { key: 'history', label: 'History', href: '/history' },
    ];

    const generateBreadcrumbs = () => {
        const pathSegments = pathname.split('/').filter(Boolean);
        return pathSegments.map((segment, index) => {
            const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
            return { title: <Link href={url}>{segment.charAt(0).toUpperCase() + segment.slice(1)}</Link>, key: url };
        });
    };
    const userMenu = (
        <Menu>
            <Menu.Item key="account">
                <Link href={"/account"}>My Account</Link>
            </Menu.Item>
            <Menu.Item key="logout" onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    // Determine the active menu item based on the current pathname
    const getActiveMenuKey = () => {
        return menuItems.find(item => `/${item.key}` === pathname)
            ? pathname.split('/')[1]
            : 'app';
    };

    return (
        <ConfigProvider>
            <Layout>
                <Header style={{ position: 'fixed', width: '100%', zIndex: 99 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            selectedKeys={[getActiveMenuKey()]}
                            style={{ lineHeight: '64px' }}
                        >
                            {menuItems.map((item) => (
                                <Menu.Item key={item.key}>
                                    <Link href={item.href}>{item.label}</Link>
                                </Menu.Item>
                            ))}
                        </Menu>
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
                <Footer style={{ textAlign: 'center' }}>
                    Ant Design ©2016 Created by Ant UED
                </Footer>
            </Layout>
        </ConfigProvider>
    );
};

export default UserLayout;
