const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { first_name, last_name, email, phone, interest, message } = req.body;

    if (!first_name || !last_name || !email || !interest) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER || 'jesus@doitforjesusacademy.org',
            pass: process.env.EMAIL_PASS
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });

    const mailOptions = {
        from: `"Academy Contact" <jesus@doitforjesusacademy.org>`,
        to: 'jesus@doitforjesusacademy.org',
        replyTo: email,
        subject: `New Contact Submission: ${interest}`,
        text: `Name: ${first_name} ${last_name}\nEmail: ${email}\nPhone: ${phone}\nInterest: ${interest}\n\nMessage:\n${message}`,
        html: `
            <h3>New Contact Submission</h3>
            <p><strong>Name:</strong> ${first_name} ${last_name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Interest:</strong> ${interest}</p>
            <p><strong>Message:</strong></p>
            <p>${message ? message.replace(/\n/g, '<br>') : 'No message provided'}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error('SMTP Error:', error);
        return res.status(500).json({ error: 'Failed to send email' });
    }
}
