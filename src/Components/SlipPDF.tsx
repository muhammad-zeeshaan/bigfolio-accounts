import { Employee } from '@/app/types';
import { dataImg } from '../../public/pdfImg';
export function renderSalarySlip({ employeeDetails }: { employeeDetails: Employee }) {
    const { name, designation, basicSalary, bonus, allowance, overtime, tax, holiday } = employeeDetails;

    // Helper Functions
    const currentDate = new Date();
    const totalDaysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const weekdaysInMonth = Array.from({ length: totalDaysInMonth }, (_, day) => new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1))
        .filter(date => date.getDay() !== 0 && date.getDay() !== 6).length;

    const oneDaySalary = basicSalary / weekdaysInMonth;
    const overtimePayment = overtime * oneDaySalary;
    const workingDays = weekdaysInMonth - holiday;
    const workingDaysPayment = workingDays * oneDaySalary;
    const totalSalary = (workingDaysPayment + overtimePayment + bonus + allowance) - tax;

    const salaryMonth = `${currentDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${currentDate.getFullYear().toString().slice(-2)}`;

    return `
        <div class="container">
            <!-- Header -->
            <div class="header">
                <img src=${dataImg} alt="Bigfolio Logo" class="header-img">
            </div>

            <!-- Employee Details -->
            <div class="content">
                <div class="employee-info">
                    <div class="employee-info-left">
                        <p>Name: <span class="bold">${name}</span></p>
                        <p>Designation: <span class="bold">${designation}</span></p>
                        <p>Salary Package: <span class="bold">${basicSalary.toFixed(2)} PKR</span></p>
                    </div>
                    <div class="employee-info-right">
                        <p class="bold">Salary Month: ${salaryMonth}</p>
                        <p>Dispatch Date: ${currentDate.toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <!-- Salary Breakdown -->
            <div class="salary-breakdown">
                <span>Details</span>
                <span>AMOUNT</span>
            </div>

            <div class="details">
                <div class="salary-item">
                    <span>Basic Salary (${workingDays} out of ${weekdaysInMonth} working days)</span>
                    <span class="right">${workingDaysPayment.toFixed(2)} PKR</span>
                </div>
                <div class="salary-item salary-item-bottom">
                    <span>Overtime</span>
                    <span class="right">${overtimePayment.toFixed(2)} PKR</span>
                </div>
                <div class="salary-item salary-item-bottom">
                    <span>Allowance</span>
                    <span class="right">${allowance.toFixed(2)} PKR</span>
                </div>
                <div class="salary-item salary-item-bottom">
                    <span>Bonus</span>
                    <span class="right">${bonus.toFixed(2)} PKR</span>
                </div>
                <div class="salary-item salary-item-bottom">
                    <span>Tax</span>
                    <span class="right">-${tax.toFixed(2)} PKR</span>
                </div>
            </div>

            <!-- Total Section -->
            <div class="total-section">
                <span>Total</span>
                <span class="right">${totalSalary.toFixed(2)} PKR</span>
            </div>

            <!-- Signature Section -->
            <div class="signature">
                <div>
                    <p class="bold">Muhammad Zeeshan</p>
                    <p class="small">CEO Bigfolio LLC</p>
                </div>
                <div>
                    <p class="bold">XXXXXX</p>
                    <p class="small">Graphic Designer</p>
                </div>
            </div>

            <!-- Footer Section -->
            <div class="footer-section">
                <div class="info">
                    <div>
                        <span>🌐</span>
                        <a href="https://www.bigfolio.co">www.bigfolio.co</a>
                    </div>
                    <div>
                        <span>✉️</span>
                        <a href="mailto:hello@bigfolio.co">hello@bigfolio.co</a>
                    </div>
                    <div>
                        <span>📞</span>
                        <a href="tel:+923147866976">+92 314-7866976</a>
                    </div>
                    <div>
                        <span>📍</span>
                        <span>24, C3, MM Alam Road, Gulberg III, Lahore</span>
                    </div>
                </div>
            </div>

            <div class="footer-end"></div>
        </div>
    `;
}
