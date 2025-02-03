import React from "react";
import { Employee } from "../types";
import { Button, Popconfirm } from "antd";

const columns = (
    handleEdit: (employee: Employee) => void,
    handleView: (employee: Employee) => void,
    handleDelete: (id: string) => void,
) => [
        {
            title: "ID",
        dataIndex: "_id",
        key: "_id",
            render: (text: string) => text,
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text: string) => text,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (text: string) => text,
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
            render: (text: string) => text,
        },
        {
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
            render: (_text: string, row: Employee) => (
                <div className="flex gap-4">
                    <Button type="primary" onClick={() => handleEdit(row)}>
                        Edit
                    </Button>
                    <Button variant="outlined" onClick={() => handleView(row)}>
                        View
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this employee?"
                        onConfirm={() => handleDelete(row._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

export default columns;
