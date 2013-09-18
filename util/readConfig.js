var fs = require('fs');

var readConfig = function(filePath){
	var jsonConfig = {};
	if(fs.existsSync(filePath)){
		jsonConfig = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
	}
	return jsonConfig; 
}
module.exports = readConfig;