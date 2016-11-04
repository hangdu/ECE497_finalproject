#!/usr/bin/env node
var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://bbbcoffeepot%40gmail.com:ece497change@smtp.gmail.com');

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"BBB" <bbbcoffeepot@gmail.com>', // sender address
    to: 'dituccjv@rose-hulman.edu', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ?', // plaintext body
    html: '<b>Hello world ?</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
