import AdminLayout from '@/Components/adminLayout'
import AdminDashboard from '@/Components/dashboard'
import loadSession from '@/utils/session';
import React from 'react'
import { SessionDTO } from './types';

export default async function page() {
    const session = await loadSession() as SessionDTO | undefined;
    return (
        <AdminLayout session={session}>
            <AdminDashboard />
            {/* <Invoice /> */}
        </AdminLayout>
        // <Invoice />
    )
}
