import History from '@/models/History';
import { HistoryDTO } from '../types';

interface FilterOptions {
    name?: string;
    email?: string;
    salaryStatus?: string;
    dispatchDate?: { month: number; year: number } | undefined;
}

interface Query {
    salaryStatus?: string;
    dispatchDate?: {
        $gte: Date;
        $lt: Date;
    };
}

interface UserMatch {
    email?: { $regex: string; $options: string };
    name?: { $regex: string; $options: string };
    salaryStatus?: { $regex: string; $options: string };
}
interface filterOptions {
    $or: UserMatch[]
}
interface FetchHistoryResponse {
    data: HistoryDTO[];
    currentPage: number;
    limit: number;
    totalRecords: number;
}

export async function fetchHistory(
    page: number,
    limit: number,
    filters: FilterOptions
): Promise<FetchHistoryResponse> {
    try {
        const query: Query = {};

        if (filters.salaryStatus) {
            query.salaryStatus = filters.salaryStatus;
        }

        if (filters.dispatchDate) {
            const { month, year } = filters.dispatchDate;
            query.dispatchDate = {
                $gte: new Date(year, month - 1, 1),
                $lt: new Date(year, month, 1),
            };
        }

        const totalRecords = await History.countDocuments(query);
        const userMatch: filterOptions = { $or: [] };
        if (filters.name) {
            userMatch.$or = [
                { email: { $regex: filters.name, $options: 'i' } },
                { name: { $regex: filters.name, $options: 'i' } },
                { salaryStatus: { $regex: filters.name, $options: 'i' } }

            ];
        }

        const history = await History.find(query)
            .populate({
                path: "user",
                model: "User",
                match: userMatch,
                select: "-profileImage -documents"
            })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean<HistoryDTO[]>();

        const filteredHistory = history.filter((item) => item.user !== null);

        const data = filteredHistory.map((his: HistoryDTO) => ({
            ...his,
            _id: his?._id?.toString(),
        }));

        return {
            data,
            currentPage: page,
            limit,
            totalRecords,
        };
    } catch (error) {
        console.error("Error fetching history:", error);
        return {
            data: [],
            currentPage: page,
            limit,
            totalRecords: 0,
        };
    }
}
