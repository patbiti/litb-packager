var os = require('os');
var ifaces = os.networkInterfaces();
var ipInfo = [];
for (var dev in ifaces) {
	var alias = 0;
	ifaces[dev].forEach(function(details) {
		if (details.family == 'IPv4') {
			if(details.address != '127.0.0.1'){
				ipInfo.push(details.address);	
			}
		}
	});
}
console.log(ipInfo);
module.exports = {
	ipList: ipInfo
}