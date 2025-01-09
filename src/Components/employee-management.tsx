"use client";
import { useState } from "react";
import { addEmployee, deleteEmployee, editEmployee } from '@/app/actions/employees';
import Table, { Column } from '@/Components/Table';
import Modal from '@/Components/Modal';
import EmployeeForm from '@/Components/EmployeeForm';
import { Button, message } from 'antd';
import { Employee } from '@/app/types';
import SalarySlip from '@/Components/Slip';
import columns from '@/app/columns/employeeColumns';
import { useRouter } from 'next/navigation';
import { SendSalarySlip } from '@/app/actions/sendPDF';

export default function EmployeeManagement({ employees, totalRecords, limit, currentPage }: { employees: Employee[], totalRecords: number, limit: number, currentPage: number }) {
    const router = useRouter();
    const [singleEmployee, setSingleEmployee] = useState<Employee | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSalaryModalOpen, setSalaryModalOpen] = useState<boolean>(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isLoading, setIsLoading] = useState<{ add: boolean, edit: boolean, delete: boolean, sendSlips: boolean }>({ add: false, edit: false, delete: false, sendSlips: false });

    const handleAddEmployee = async (newEmployee: Employee) => {
        setIsLoading(prev => ({ ...prev, add: true }));
        try {
            await addEmployee(newEmployee);
            message.success('Employee added successfully.');
            setIsModalOpen(false);
            router.refresh();
        } catch (error) {
            message.error('Failed to add employee.');
            console.error(error)
        } finally {
            setIsLoading(prev => ({ ...prev, add: false }));
        }
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

        setIsLoading(prev => ({ ...prev, edit: true }));
        try {
            await editEmployee({ ...updatedEmployee, _id: singleEmployee._id });
            message.success('Employee updated successfully.');
            router.refresh();
            setIsModalOpen(false);
            setSingleEmployee(null);
        } catch (error) {
            message.error('Failed to update employee.');
            console.log(error)
        } finally {
            setIsLoading(prev => ({ ...prev, edit: false }));
        }
    };

    const handleView = (emp: Employee) => {
        setSingleEmployee(emp);
        setSalaryModalOpen(true);
    };

    const handleDelete = async (id: string | undefined | null) => {
        if (!id) return;

        setIsLoading(prev => ({ ...prev, delete: true }));
        try {
            await deleteEmployee(id);
            message.success('Employee deleted successfully.');
            router.refresh();
        } catch (error) {
            message.error('Failed to delete employee.');
            console.log(error)
        } finally {
            setIsLoading(prev => ({ ...prev, delete: false }));
        }
    };

    const sendSlips = async () => {
        if (!selectedRowKeys.length) return;

        setIsLoading(prev => ({ ...prev, sendSlips: true }));
        try {
            await SendSalarySlip({ employeeIds: selectedRowKeys });
            message.success('Salary slips sent successfully.');
            setSelectedRowKeys([]);
        } catch (error) {
            message.error('Failed to send salary slips.');
            console.log(error)
        } finally {
            setIsLoading(prev => ({ ...prev, sendSlips: false }));
        }
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
                    loading={isLoading.add}
                >
                    Add Employee
                </Button>
                {selectedRowKeys.length > 0 && (
                    <Button
                        type="primary"
                        onClick={sendSlips}
                        loading={isLoading.sendSlips}
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
                        loading={isLoading.add || isLoading.edit}
                    />
                </>
            </Modal>

            <Modal isOpen={isSalaryModalOpen} onClose={() => setSalaryModalOpen(false)}>
                {singleEmployee && <SalarySlip employeedetail={singleEmployee} />}
            </Modal>
        </main>
    );
}
