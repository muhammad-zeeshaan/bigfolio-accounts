import React, { useState } from "react";
import { Employee } from "../types";
import { Button, Popconfirm, Space, Tooltip } from "antd";
import {
    EditOutlined,
    EyeOutlined,
    UserOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import Link from "next/link";
const Columns = (
    handleEdit: (employee: Employee) => void,
    handleView: (employee: Employee) => void,
    handleDelete: (id: string) => void,
    editLoading: boolean
) => {
    const [id, setId] = useState<string>("");
    return (
        [
            {
                title: "ID",
                dataIndex: "_id",
                key: "_id",
                render: (text: string) => <span className="font-mono">{text}</span>,
            },
            {
                title: "Name",
                dataIndex: "name",
                key: "name",
                render: (text: string) => <span className="font-medium">{text}</span>,
            },
            {
                title: "Email",
                dataIndex: "email",
                key: "email",
                render: (text: string) => <Link href={`mailto:${text}`}>{text}</Link>,
            },
            {
                title: "Phone",
                dataIndex: "phone",
                key: "phone",
                render: (text: string) => <span>{text}</span>,
            },
            {
                title: "Actions",
                dataIndex: "actions",
                key: "actions",
                render: (_text: string, row: Employee) => (
                    <Space size="middle">
                        <Tooltip title="Edit">
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setId(row?._id)
                                    return handleEdit(row)
                                }}
                                loading={editLoading && (row?._id === id)}
                            />
                        </Tooltip>

                        <Tooltip title="View">
                            <Button
                                type="default"
                                icon={<EyeOutlined />}
                                onClick={() => handleView(row)}
                            />
                        </Tooltip>

                        <Tooltip title="Profile">
                            <Button type="link" icon={<UserOutlined />}>
                                <Link href={`/admin/${row._id}`} passHref>
                                    <>Profile</>
                                </Link>
                            </Button>
                        </Tooltip>

                        <Tooltip title="Delete">
                            <Popconfirm
                                title="Are you sure you want to delete this employee?"
                                onConfirm={() => handleDelete(row._id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button type="primary" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </Tooltip>
                    </Space>
                ),
            },
        ]
    )
}

export default Columns;