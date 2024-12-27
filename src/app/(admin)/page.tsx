import EmployeeManagement from '@/Components/employee-management';
import { fetchEmployees } from '../actions/employees';

export default async function Home({ searchParams }: { searchParams: { page?: string, limit?: string } }) {
    const page = searchParams?.page ?? 1;
    const pageSize = searchParams?.limit ?? 10;
    const { data, totalRecords, limit, currentPage } = await fetchEmployees(+page, +pageSize)
    return (
        <>
            <EmployeeManagement employees={data} totalRecords={totalRecords} limit={limit} currentPage={currentPage} />
        </>
    );
}
