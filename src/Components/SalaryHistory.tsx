"use client";
import React from "react";
import Table from "./Table";
import { HistoryDTO } from "@/app/types";
import columns from "@/app/columns/slipHistory";
import { Input, DatePicker } from "antd";
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
        <div style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "16px",
            width: "100%",
            maxWidth: "800px",
            marginLeft: "auto",
        }}>
            <Input
                placeholder="Search by Name, Email, or Status"
                type="search"
                onChange={(e) => handleFilterChange("name", e.target.value)}
                style={{ width: "300px" }}
            />
            <DatePicker
                picker="month"
                onChange={(date) => {
                    handleFilterChange(
                        "dispatchDate",
                        date ? date.format("YYYY-MM") : ""
                    );
                }}
                placeholder="Dispatch Month/Year"
                style={{ width: "200px" }} 
            />
        </div>
    );

    const historyColumns = columns();

    return (
        <>
            <h1 className="text-2xl font-bold mb-6">Employee History</h1>
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