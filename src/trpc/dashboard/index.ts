import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { z } from "zod";
import History from '@/models/History';
import { publicProcedure, router } from '../init';

export const dashboardRouter = router({
    getAnalytics: publicProcedure.query(async () => {
        const totalEmployees = await User.countDocuments();

        const today = new Date().toISOString().split("T")[0];
        const attendanceToday = await Attendance.find({ date: today });
        const presentToday = attendanceToday.filter((a) => a.checkOutTime).length;
        const absentToday = totalEmployees - presentToday;

        const currentMonth = new Date().toISOString().split("T")[0].slice(0, 7);
        const salarySlipsSent = await History.countDocuments({
            dispatchDate: { $regex: currentMonth },
            salaryStatus: "Send",
        });

        return {
            totalEmployees,
            presentToday,
            absentToday,
            salarySlipsSent,
        };
    }),

    getAttendanceTrend: publicProcedure
        .input(
            z.object({
                startDate: z.string(),
                endDate: z.string(),
            })
        )
        .query(async ({ input }) => {
            const { startDate, endDate } = input;

            const attendanceData = await Attendance.aggregate([
                {
                    $match: {
                        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                        present: { $sum: { $cond: [{ $ne: ["$checkOutTime", null] }, 1, 0] } },
                        absent: { $sum: { $cond: [{ $eq: ["$checkOutTime", null] }, 1, 0] } },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);

            return attendanceData.map((d) => ({
                month: d._id,
                present: d.present,
                absent: d.absent,
            }));
        }),

    getSalaryDistribution: publicProcedure.query(async () => {
        const salaryData = await User.aggregate([
            {
                $group: {
                    _id: null,
                    basicSalary: { $sum: "$basicSalary" },
                    allowance: { $sum: "$allowance" },
                    bonus: { $sum: "$bonus" },
                    tax: { $sum: "$tax" },
                },
            },
        ]);

        return {
            basicSalary: salaryData[0]?.basicSalary || 0,
            allowance: salaryData[0]?.allowance || 0,
            bonus: salaryData[0]?.bonus || 0,
            tax: salaryData[0]?.tax || 0,
        };
    }),
});