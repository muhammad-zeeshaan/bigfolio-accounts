"use client";
import React from "react";
import Table from "./Table";
import { HistoryDTO } from "@/app/types";
import columns from "@/app/columns/slipHistory";
import { Input, Select, DatePicker } from "antd";
import useQueryParams from '@/app/hooks/useQueryParams';

export default function SalaryHistory({
    history,
    totalRecords,
    limit,
    currentPage,
}: {
    history: HistoryDTO[];
    totalRecords: number;
    limit: number;
    currentPage: number;
}) {
    const params = useQueryParams();
    const handleFilterChange = (key: string, value: string) => {
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.update();
    };

    const filterComponents = (
        <div style={{ marginBottom: "16px", display: "flex", gap: "16px" }}>
            <Input
                placeholder="Search by Name"
                type='search'
                onChange={(e) => handleFilterChange("name", e.target.value)}
            />
            <Input
                placeholder="Search by Email"
                type='search'
                onChange={(e) => handleFilterChange("email", e.target.value)}
            />
            <Select
                placeholder="Salary Status"
                onChange={(value) => handleFilterChange("salaryStatus", value)}
                style={{ width: 200 }}
            >
                <Select.Option value="">All</Select.Option>
                <Select.Option value="Send">Send</Select.Option>
                <Select.Option value="Pending">Pending</Select.Option>
            </Select>
            <DatePicker
                picker="month"
                onChange={(date) => {
                    handleFilterChange(
                        "dispatchDate",
                        date ? date.format("YYYY-MM") : ""
                    );
                }}
                placeholder="Dispatch Month/Year"
            />
        </div>
    );

    const historyColumns = columns();

    return (
        <>
            <h1 className="text-3xl font-semibold mb-4">Employee History</h1>
            {filterComponents}
            <Table
                data={history}
                columns={historyColumns}
                paginationConfig={{
                    total: totalRecords,
                    current: currentPage,
                    pageSize: limit,
                }}
            />
        </>
    );
}
