import { renderSalarySlip } from './SlipPDF'
import { Employee } from '@/app/types'

export default function SlipTemplate({ employeeDetails }: { employeeDetails: Employee }) {
  return (
    `
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 0; }
                    .header { background-color: #013a4d; padding: 10px 25px 10px 15px; border-top-right-radius: 63px; display: flex; justify-content: end; align-items: center; width:240px; margin-top:40px; }
                    .header-img { height:40px; }
                    .content { margin-left: 20px; margin-right: 20px; }
                    .salary-breakdown { background-color: rgb(255, 231, 177); padding: 10px 20px; font-weight: bold; display: flex; justify-content: space-between; }
                    .details { padding: 10px 20px; }
                    .total-section { font-weight: bold; font-size: 16px; padding: 10px 20px; margin-top: 20px; display: flex; justify-content: space-between; }
                    .footer { background-color: rgb(255, 231, 177); padding: 15px 20px; font-size: 12px; color: #555; margin-top: 30px; }
                    .employee-info { display: flex; justify-content: space-between; font-size: 14px; padding: 10px; }
                    .employee-info-left { font-size: 14px; }
                    .employee-info-right { text-align: right; font-size: 14px; }
                    .salary-item { display: flex; justify-content: space-between; padding: 8px 0; }
                    .total-section { font-weight: bold; font-size: 16px; padding: 10px 20px; margin-top: 20px; display: flex; justify-content: space-between; }
                    .signature { display: grid; grid-template-columns: 1fr 1fr; margin-top: 30px; text-align: center; }
                    .footer-section { background-color: rgb(255, 231, 177); margin-top: 32px; padding: 16px 56px; font-size: 14px; color: #4B4B4B; }
                    .footer-section .info { display: flex; justify-content: space-between; }
                    .footer-section .info div { display: flex; align-items: center; }
                    .footer-section a { text-decoration: underline; }
                    .footer-end { background-color: rgb(2, 58, 76); height: 70px; }
                  </style>
                </head>
                <body>
                  ${renderSalarySlip({ employeeDetails })} 
                </body>
              </html>
            `
  )
}
