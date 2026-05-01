const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static('./'));

// SMTP Transport Configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // TLS
    auth: {
        user: process.env.EMAIL_USER || 'jesus@doitforjesusacademy.org',
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers: 'SSLv3'
    }
});

// Contact Form Endpoint
app.post('/api/contact', async (req, res) => {
    const { first_name, last_name, email, phone, interest, message } = req.body;

    if (!first_name || !last_name || !email || !interest) {
        return res.status(400).json({ error: 'Please fill out all required fields.' });
    }

    const mailOptions = {
        from: `"${first_name} ${last_name}" <jesus@doitforjesusacademy.org>`, // Must be the authenticated user or an alias
        to: 'jesus@doitforjesusacademy.org',
        replyTo: email,
        subject: `New Contact Form Submission: ${interest}`,
        text: `
            Name: ${first_name} ${last_name}
            Email: ${email}
            Phone: ${phone || 'Not provided'}
            Interest: ${interest}
            
            Message:
            ${message || 'No message provided.'}
        `,
        html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${first_name} ${last_name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Interest:</strong> ${interest}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${message ? message.replace(/\n/g, '<br>') : 'No message provided.'}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
