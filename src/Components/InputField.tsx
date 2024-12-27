"use client";
import React from "react";
import { Input, InputNumber, Select } from "antd";

const { Option } = Select;

interface InputFieldProps {
    label: string;
    name: string;
    type?: string;
    value: string | number;
    options?: { value: string; label: string }[]; // For select inputs
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement> | number | string) => void;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    name,
    type = "text",
    value,
    options,
    placeholder,
    onChange,
}) => {
    const handleChange = (newValue: number | string | React.ChangeEvent<HTMLInputElement>) => {
        if (typeof newValue === "number" || typeof newValue === "string") {
            onChange(newValue); // For InputNumber and Select
        } else {
            onChange(newValue); // For regular inputs
        }
    };

    return (
        <div className="flex flex-col gap-2 mb-4">
            <label className="font-medium text-gray-700" htmlFor={name}>
                {label}
            </label>
            {options ? (
                <Select
                    id={name}
                    value={value as string}
                    onChange={(value) => handleChange(value)}
                    placeholder={placeholder}
                    className="w-full"
                >
                    {options.map((option) => (
                        <Option key={option.value} value={option.value}>
                            {option.label}
                        </Option>
                    ))}
                </Select>
            ) : type === "number" ? (
                <InputNumber
                    id={name}
                    value={value as number}
                    onChange={(value) => handleChange(value || 0)}
                    placeholder={placeholder}
                    className="w-full"
                />
            ) : (
                <Input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
};

export default InputField;
