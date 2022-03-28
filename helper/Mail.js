const nodemailer = require("nodemailer");
exports.generateToken = () => {
  let otp = "";
  for (let i = 0; i <= 3; i++) {
    const randomToken = Math.round(Math.random() * 9);
    otp = otp + randomToken;
  }
  return otp;
};

exports.mailTransport = () =>
  nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  }); 
 
exports.generateMailTemplate = (code, name) => {
  return `
   <!DOCTYPE html>
   <html lang="en">
   <head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE-edge">
   <style>
   @media only screen and (min-width: 620px){
      h1{
         font-size: 20px;
         padding: 5px;
      }
   }
   </style>
   </head>
   <body>
      <div>
      <div style="max-width: 620px; margin: 0 auto; font-family: sans-serif; color: #272727;">
      <h1 style="background: #f6f6f6; padding: 10px; text-align: center; color: #272727;">
      We are delighted to welcome you to Farm Ride!!
      </h1>
      <p>Mr/Mrs ${name} Please Verify your email to continue. Your Verification Code is:</p>
      <p style="width: 80px; margin: 0 auto; font-weight: bold; text-align: center; background: #f6f6f6; border-radius: 5px; font-size: 25px;">
      ${code}
      </p>
      </div>
      </div>
   </body>
   </html>
   `;
};

exports.plainMailTemplate = (heading, message, name) => {
  return `
   <!DOCTYPE html>
   <html lang="en">
   <head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE-edge">
   <style>
   @media only screen and (min-width: 620px){
      h1{
         font-size: 20px;
         padding: 5px;
      }
   }
   </style>
   </head>
   <body>
      <div>
      <div style="max-width: 620px; margin: 0 auto; font-family: sans-serif; color: #272727;">
      <h1 style="background: #f6f6f6; padding: 10px; text-align: center; color: #272727;">
      ${heading}
      </h1>
      <h1>${name}</h1>
      <p style="color: #272727; text-align: center;">
      ${message}
      </p>
      </div>
      </div>
   </body>
   </html>
   `;
};

exports.generateResetTokenTemplate = (name, url) => {
  return `
   <!DOCTYPE html>
   <html lang="en">
   <head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE-edge">
   <style>
   @media only screen and (min-width: 620px){
      h1{
         font-size: 20px;
         padding: 5px;
      }
   }
   </style>
   </head>
   <body>
      <div>
      <div style="max-width: 620px; margin: 0 auto; font-family: sans-serif; color: #272727;">
      <h1 style="background: #f6f6f6; padding: 10px; text-align: center; color: #272727;">
      Response to Your Reset Password Request
      </h1>
      <p>Mr/Mrs ${name} Please click on the link below to your reset password:</p>
      <div style="text-align: center;">
      <a href="${url}" style="font-family: sans-serif; margin:0 auto; padding:20px; text-align: center; background: #e63946; border-radius: 5px; font-size: 20px 10px; color: #fff; cursor: pointer;
      text-decoration: none; display: inline-block;">
      Reset Password
      </a>
      </div>
      </div>
      </div>
   </body>
   </html>
   `;
};
