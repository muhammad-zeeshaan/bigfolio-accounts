'use client';
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, Space } from 'antd';
import { ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';
import { redirect, usePathname, useRouter } from 'next/navigation';
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
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setIsDarkMode(false);
    }, []);

    const handleLogout = () => {
        signOut();
    };

    const handleAccount = () => {
        router.push('/account');
    };

    const menuItems = [
        { key: 'calendar', label: 'Calendar', href: '/calendar' },
        { key: 'history', label: 'History', href: '/history' },
        { key: 'app', label: 'App', href: '/calendar' },
    ];

    const breadcrumbItems = [
        { key: 'calendar', title: 'Calendar', href: '/calendar' },
        { key: 'app', title: 'App', href: '/' },
    ];

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

    // Determine the active menu item based on the current pathname
    const getActiveMenuKey = () => {
        const pathSegments = pathname.split('/');
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

export default UserLayout;
