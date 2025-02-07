"use client";
import { useState } from "react";
import Table, { Column } from '@/Components/Table';
import Modal from '@/Components/Modal';
import EmployeeForm from '@/Components/EmployeeForm';
import { Button, message } from 'antd';
import { Employee } from '@/app/types';
import SalarySlip from '@/Components/Slip';
import columns from '@/app/columns/employeeColumns';
import { useRouter } from 'next/navigation';
import { trpc } from '@/utils/trpcClient';

export default function EmployeeManagement({ employees, totalRecords, limit, currentPage }: { employees: Employee[], totalRecords: number, limit: number, currentPage: number }) {
    const router = useRouter();
    const [singleEmployee, setSingleEmployee] = useState<Employee | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSalaryModalOpen, setSalaryModalOpen] = useState<boolean>(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    // tRPC Mutations
    const addEmployeeMutation = trpc.employee.addEmployee.useMutation({
        onSuccess: () => {
            message.success('Employee added successfully.');
            setIsModalOpen(false);
            router.refresh();
        },
        onError: () => {
            message.error('Failed to add employee.');
        },
    });

    const editEmployeeMutation = trpc.employee.editEmployee.useMutation({
        onSuccess: () => {
            message.success('Employee updated successfully.');
            setIsModalOpen(false);
            setSingleEmployee(null);
            router.refresh();
        },
        onError: () => {
            message.error('Failed to update employee.');
        },
    });

    const deleteEmployeeMutation = trpc.employee.deleteEmployee.useMutation({
        onSuccess: () => {
            message.success('Employee deleted successfully.');
            router.refresh();
        },
        onError: () => {
            message.error('Failed to delete employee.');
        },
    });

    const sendSalarySlipMutation = trpc.employee.sendSalarySlip.useMutation({
        onSuccess: () => {
            message.success('Salary slips sent successfully.');
            setSelectedRowKeys([]);
        },
        onError: () => {
            message.error('Failed to send salary slips.');
        },
    });

    const handleAddEmployee = async (newEmployee: Employee) => {
        await addEmployeeMutation.mutateAsync(newEmployee);
    };

    const handleEdit = (emp: Employee) => {
        setSingleEmployee(emp);
        setIsModalOpen(true);
    };

    const handleEditEmployee = async (updatedEmployee: Employee) => {
        if (!singleEmployee?._id) {
            console.error('Employee ID not found!');
            return;
        }
        await editEmployeeMutation.mutateAsync({ ...updatedEmployee, _id: singleEmployee._id });
    };

    const handleView = (emp: Employee) => {
        setSingleEmployee(emp);
        setSalaryModalOpen(true);
    };

    const handleDelete = async (id: string | undefined | null) => {
        if (!id) return;
        await deleteEmployeeMutation.mutateAsync({ id });
    };

    const sendSlips = async () => {
        if (!selectedRowKeys.length) return;
        await sendSalarySlipMutation.mutateAsync({ employeeIds: selectedRowKeys });
    };

    return (
        <main className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-semibold">Employee Management</h1>
            <div className="mb-4 flex justify-end gap-3">
                <Button
                    type="primary"
                    onClick={() => {
                        setIsModalOpen(true);
                        setSingleEmployee(null);
                    }}
                    loading={addEmployeeMutation.isLoading}
                >
                    Add Employee
                </Button>
                {selectedRowKeys.length > 0 && (
                    <Button
                        type="primary"
                        onClick={sendSlips}
                        loading={sendSalarySlipMutation.isLoading}
                    >
                        Send Slips
                    </Button>
                )}
            </div>

            <Table
                data={employees}
                setSelectedRowKeys={setSelectedRowKeys}
                selectedRowKeys={selectedRowKeys}
                columns={columns(handleEdit, handleView, handleDelete) as Column<Employee>[]}
                paginationConfig={{
                    total: totalRecords,
                    current: currentPage,
                    pageSize: limit
                }}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <>
                    <h2 className="text-2xl font-semibold mb-4 text-center">
                        {singleEmployee ? "Edit Employee" : "Add New Employee"}
                    </h2>
                    <EmployeeForm
                        onSubmit={singleEmployee ? handleEditEmployee : handleAddEmployee}
                        employee={singleEmployee ?? undefined}
                        loading={addEmployeeMutation.isLoading || editEmployeeMutation.isLoading}
                    />
                </>
            </Modal>
            <Modal isOpen={isSalaryModalOpen} onClose={() => setSalaryModalOpen(false)}>
                {singleEmployee && <SalarySlip employeedetail={singleEmployee} />}
            </Modal>
        </main>
    );
}