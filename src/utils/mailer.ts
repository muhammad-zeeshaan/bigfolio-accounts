import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'dev.superu@gmail.com',
        pass: 'oqts uugf diot eaes',
    },
});
export default transporter