import { Employee } from '@/app/types';
import fs from "fs";
import path from "path";

// Path to the JSON file
const filePath = path.join(process.cwd(), "src/data/employees.json");

// Function to get employees from the file
export async function getEmployees() {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

// Function to save employees to the file
export async function saveEmployees(employees: Employee[]) {
    fs.writeFileSync(filePath, JSON.stringify(employees, null, 2));
}
