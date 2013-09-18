var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  ,exec = require('child_process').exec;

server.listen(9527);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/static/index.html');
});

function show_exit(code, actionType){
  var result = {'result': ('子进程已关闭，代码：' + code)};
  if(actionType){
    result.actionType = actionType;
  }
  socket.emit('exit_info', actionType);
}

io.sockets.on('connection', function (socket) {
  socket.on('packager', function(data){
    var actionType = 'packager ' + data.comments || '';
    last = exec('sh ~/sh/test1.sh');
    
    last.stdout.on('data', function (data) {
        socket.emit('show_result_lasting',{'result': data})
    });

    last.on('exit', function (code) {
      show_exit(code, actionType);
    });
  });

  // socket.on('show', function(){
  //   var exec = require('child_process').exec,
  //   last = exec('ls /data/git/tmp/lightsource_*.tgz');
  //   last.stdout.on('data', function (data) {
  //       socket.emit('show_result',{'result': data})
  //   });

  //   last.on('exit', function (code) {
  //       socket.emit('exit_info',{'result': ('子进程已关闭，代码：' + code)});
  //   });
  // });

  socket.on('git_update', function(data){
    var actionType = 'git action: '+ data.data || '';
    last = exec('sh ' + __dirname + '/batch/git_update.sh ' + data.data);
    last.stdout.on('data', function (data) {
        socket.emit('git_renew',{'result': data})
    });

    last.on('exit', function (code) {
        socket.emit('exit_info',{'result': ('子进程已关闭，代码：' + code)});
    });
  });

  socket.on('choose', function(){
    var existFile = fs.readdirSync('/data/git/tmp');
    socket.emit('file_list',{'result': existFile});
  });
});