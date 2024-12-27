"use client";
import React, { Dispatch, ReactNode, SetStateAction } from "react";
import { Table as AntdTable } from "antd";
import useQueryParams from '@/app/hooks/useQueryParams';

export interface Column<T> {
    dataIndex?: string | string[];
    title: string;
    key: string;
    render?: (value: any, record: T, index: number) => ReactNode;
}

interface paginationConfigDTO {
    current: number;
    pageSize: number;
    total: number;
}
export interface CustomTableProps<T> {
    columns: Column<T>[];
    data: T[];
    paginationConfig?: paginationConfigDTO;
    selectedRowKeys?: React.Key[];
    setSelectedRowKeys?: Dispatch<SetStateAction<React.Key[]>>;
}

export default function Table<T extends { _id: React.Key }>({ columns, data, paginationConfig, setSelectedRowKeys, selectedRowKeys }: CustomTableProps<T>) {
    const params = useQueryParams();

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        if (setSelectedRowKeys) setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    return (
        <AntdTable
            columns={columns}
            dataSource={data}
            rowKey="_id"
            rowSelection={rowSelection}
            pagination={{
                ...paginationConfig,
                pageSizeOptions: ["10", "20", "50"],
                showSizeChanger: true,
            }}
            onChange={(page) => {
                params.set('page', page?.current ?? '');
                params.set('limit', page.pageSize ?? '');
                params.update();
            }}
            scroll={{
                x: 400,
            }}
        />
    );
}
