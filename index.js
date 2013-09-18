var express = require('express');
var path = require('path');
var os = require('os');
var fs = require('fs');
var conf = require("argsparser").parse();
var config = {
    documentRoot    : conf['-root'] && conf['-root'] !== 'undefined'? conf['-root'] : process.cwd(),
    port            : parseInt(conf['-port']) || 8888
};

process.on('uncaughtException', function(err) {
    console.error('Caught exception: ', err);
});

var pidPath = path.join(os.tmpDir(), config.port + '.node_pid');
fs.writeFile(pidPath, process.pid);

process.on('SIGTERM', function() { //SIGKILL是kill -9 的信号,无法捕获; SIGTERM是kill的信号,可以捕获
    console.log('HTTPD killed');

    fs.unlink(pidPath, function() {
        process.exit(0);
    });
});

process.title = 'ria-server'; //linux only
var app = express();
// app.get('/admin/:mod', function(req, res) {
//     res.writeHead(200, {
//         'Content-Type': 'text/html;charset=utf-8'
//     });
//     var mod = req.params['mod'];
//     if (mod === 'debug') {
//         isDebug = true;
//         res.write('<b>server running in debug mod.</b>');
//     }
//     if (mod === 'release') {
//         isDebug = false;
//         res.write('<b>server running in release mod.</b>');
//     }
//     res.end('<ul><li><a href="/admin/debug">set debug mod</a></li><li><a href="/admin/release">set release mod</a></li></ul>');
// });

app.get('/admin/shell', function(req, res){
	res.writeHead(200, {
        'Content-Type': 'text/html;charset=utf-8'
    });
    res.write('<h1>test</h1>')
    res.write('<p><button id="shell">pack</button></p>')
    var exec = require('child_process').exec,
    // last = exec('sh ~/sh/packager.sh master 1.3.6.10');
    last = exec('ls');
    // var spawn = require('child_process').spawn,
	// last  = spawn('sh ~/sh/test.sh', ['abc', 'asdfas', 'asdfasd']);

	last.stdout.on('data', function (data) {
	    // console.log('标准输出：' + data);
	    res.write('<div id="shell">'+data+'</div>');
	});

	last.on('exit', function (code) {
	    res.end('子进程已关闭，代码：' + code);
	});
    
    
});


if (config.documentRoot) { //下面的2句必须在自定义路由规则之后
    app.use(express['static'](config.documentRoot));
    app.use(express.directory(config.documentRoot));
}

app.listen(config.port);
console.log('################################################');
console.log('ria  server (pid: ' + process.pid + ') started! please visit http://127.0.0.1:' 
    + config.port + ' . documentRoot is: ' + config.documentRoot);
console.log('################################################');