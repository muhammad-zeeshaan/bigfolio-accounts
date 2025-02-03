import { fetchHistory } from '@/app/actions/history';
import SalaryHistory from '@/Components/SalaryHistory';

export default async function Home({ searchParams }: { searchParams: { page?: string, limit?: string, name?: string, email?: string, salaryStatus?: string, dispatchDate?: string } }) {
    const page = searchParams?.page ?? 1;
    const pageSize = searchParams?.limit ?? 10;
    const name = searchParams?.name ?? ''
    const email = searchParams?.email ?? ''
    const salaryStatus = searchParams?.salaryStatus ?? ''
    const dispatchDate = searchParams?.dispatchDate?.split('-') ?? ''
    const dispatchFilter = dispatchDate ? { year: +dispatchDate[0], month: +dispatchDate[1] } : undefined

    const { data, totalRecords, limit, currentPage } = await fetchHistory(+page, +pageSize, { name, email, salaryStatus, dispatchDate: dispatchFilter })
    return (
        <>
            <SalaryHistory history={data} totalRecords={totalRecords} limit={limit} currentPage={currentPage} />
        </>
    );
}
