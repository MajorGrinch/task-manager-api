const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'majorgrinch@gmail.com',
        subject: 'Thanks for signing up!',
        text: `Welcome to the task app, ${name}. Let me know how you get along with the app.`
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'majorgrinch@gmail.com',
        subject: 'Survey for our app',
        text: `Hello, ${name}. We appreciate the time you spent on our app and we do want to make a survey on why you cancel the account`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}