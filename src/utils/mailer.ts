import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_KEY,
    },
});
export default transporter