const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        // Use real email service (like Gmail)
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    } else {
        // Fallback to Ethereal testing service if no credentials provided
        console.log('\n[Development] No email credentials found in .env. Creating Ethereal test account...');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    const message = {
        from: `${process.env.FROM_NAME || 'Reshell'} <${process.env.FROM_EMAIL || 'noreply@reshell.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    try {
        const info = await transporter.sendMail(message);
        
        if (process.env.EMAIL_USER) {
            console.log('Real email sent successfully to: %s', options.email);
        } else {
            console.log('\n------------------------------------------------------------------');
            console.log('📧 TEST EMAIL SENT! (It was NOT sent to the real Gmail address)');
            console.log('To view the email, click this link:');
            console.log('👉 ' + nodemailer.getTestMessageUrl(info));
            console.log('------------------------------------------------------------------\n');
        }
    } catch (err) {
        console.error('Error sending email:', err);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
