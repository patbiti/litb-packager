var nodemailer = require("nodemailer");
var mailConfig = {
	service: "Gmail",
	auth: {
		user: " litb.ria@gmail.com",
		pass: "ria.litb"
	}
}
// var smtpTransport = nodemailer.createTransport("SMTP", mailConfig);
var smtpTransport = nodemailer.createTransport("SMTP",{
	host: "smtp.exmail.qq.com", // hostname
	secureConnection: true, // use SSL
	port: 465
// setup e-mail data with unicode symbols



var sendmail = function(options, cb){
	// send mail with defined transport object
	smtpTransport.sendMail(options, function(error, response){
	    if(error){
	        console.log(error);
	        cb(error,false);
	    }else{
	        cb("Message sent: " + response.message,true);
	    }
	    smtpTransport.close();
	    // if you don't want to use this transport object anymore, uncomment following line
	    //smtpTransport.close(); // shut down the connection pool, no more messages
	});
}
module.exports = {
	'sendMail' : sendmail
};
