'use client';
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, Space } from 'antd';
import { ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';
import { redirect, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { UserOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

interface LayoutProps {
    children: ReactNode;
    session?: unknown;
}

const AppLayout: React.FC<LayoutProps> = ({ children, session }) => {
    if (!session) {
        redirect('/signin');
    }

    const [isDarkMode, setIsDarkMode] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            const isDark = savedTheme === 'dark'
            setIsDarkMode(isDark);
        } else {
            const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDarkScheme);
        }
    }, []);

    // const toggleTheme = () => {
    //     setIsDarkMode(prev => !prev);
    //     localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
    // };

    const handleLogout = () => {
        signOut();
    };

    const handleAccount = () => {
        router.push('/account');
    };

    const menuItems = [
        { key: 'home', label: 'Home', href: '/' },
        { key: 'calendar', label: 'Calendar', href: '/calendar' },
        { key: 'history', label: 'History', href: '/history' },
        { key: 'app', label: 'App', href: '/' },
    ];

    const breadcrumbItems = [
        { key: 'home', title: 'Home', href: '/' },
        { key: 'calendar', title: 'Calendar', href: '/calendar' },
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
        <ConfigProvider
            theme={{
                algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
            }}
        >
            <Layout>
                <Header style={{ position: 'fixed', width: '100%', zIndex: 99 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Menu
                            theme={'dark'}
                            mode="horizontal"
                            defaultSelectedKeys={['home']}
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

export default AppLayout;
