var nodemailer = require("nodemailer");
var mailConfig = {
	service: "Gmail",
	auth: {
		user: " litb.ria@gmail.com",
		pass: "ria.litb"
	}
}
var smtpTransport = nodemailer.createTransport("SMTP", mailConfig);

// setup e-mail data with unicode symbols



var sendmail = function(options){
	// send mail with defined transport object
	smtpTransport.sendMail(options, function(error, response){
	    if(error){
	        console.log(error);
	    }else{
	        console.log("Message sent: " + response.message);
	    }
	    smtpTransport.close();
	    // if you don't want to use this transport object anymore, uncomment following line
	    //smtpTransport.close(); // shut down the connection pool, no more messages
	});
}
module.exports = {
	'sendMail' : sendmail
};
//test case
var mailOptions = {
    from: "litb-packager✔ <litb.ria@gmail.com>", // sender address
    to: "wenhuajian@lightinthebox.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world ✔", // plaintext body
    html: "<b>Hello world1 ✔</b>" // html body
}
sendmail(mailOptions);
