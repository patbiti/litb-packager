var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , exec = require('child_process').exec
  , readConfig = require('./util/readConfig')
  , sendmail = require('./util/sendmail')
  , dirConfig
  , Mustache = require('mustache')
  , crypto = require('crypto')
  , mailConfig
  , last
  , isPacking;


var md5sum = function(path, key){
  var hash = crypto.createHash('md5').update(str).digest("hex").substr(0,16);//hex为32位
  return hash;
}

var getMd5sumByshell = function(filepath, cb){
    var command = 'md5sum ' + filepath;
    last = exec(command);
    var output = '';
    last.stdout.on('data', function (data) {
        output = output + data;
    });

    last.on('close', function (code) {
      cb(output.split(' ')[0], code);
    });
}


//init params
dirConfig = readConfig(__dirname  + '/config/dir.json');
mailConfig = readConfig(__dirname + '/config/maillist.json');

server.listen(9527);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/static/index.html');
});


//upload to be finished;


io.sockets.on('connection', function (socket) {
  function show_exit(code, actionType){
    var result = {'result': ('子进程已关闭，代码：' + code)};
    if(actionType){
      result.actionType = actionType;
    }
    if(code === true){
      result.alert = true;
    }
    socket.emit('exit_info', result);
  }

  socket.on('packager', function(data){
    isPacking = true;
    var actionType = 'git action: '+ data.type || '';
    if(data.type == 0){
      var existFile = fs.readdirSync(dirConfig['download-dir']);
      socket.emit('file_list',{'result': existFile});
      socket.emit('packager_over',{
        'maillist' : mailConfig.contacts,
        'template' : mailConfig.template,
        'type' : data.type
      })
      show_exit(0, actionType);
      isPacking = false;
    }else{
      var command = 'sh ' + __dirname + '/batch/packager.sh ' + data.branch + ' ' + data.packagerno + ' ' + '' || data.comments;
      last = exec(command);
      
      last.stdout.on('data', function (data) {
          socket.emit('packager_result',{'result': data})
      });

      last.on('close', function (code) {
        socket.emit('packager_over',{
          'maillist' : mailConfig.contacts,
          'template' : mailConfig.template,
          'type' : data.type
        })
        isPacking = false;
        show_exit(code, actionType);
      });
    }
    
  });

  socket.on('isPacking', function(data){
    if(isPacking && isPacking === true){
        socket.emit('checkPacking',{
          'flag' : false
        })
    }else{
        socket.emit('checkPacking',{
          'flag' : true
        })
    }
  })

  socket.on('sendmail', function(arr){
    var data = {};
    for(var i = 0; i < arr.length; i++){
      if(data[arr[i].name]){
        data[arr[i].name] = data[arr[i].name] + ', '+ arr[i].value; 
      }else{
        data[arr[i].name] = arr[i].value; 
      }
    }
    //init md5
    var filepath = dirConfig['download-dir'] + data.tagname + '.tgz';
    var md5Cb = function(md5){
      var actionType = 'send email';
      data.isQA = data.testtype && data.testtype.indexOf('功能测试')>-1 ? true : false;
      data.isUI = data.testtype && data.testtype.indexOf('UI测试')>-1 ? true : false;
      data.url = dirConfig['request-url'];
      data.tagname = data.tagname;
      data.md5 = md5;
      data.description = data.description.replace('\n','<br>');
      var html = Mustache.render(mailConfig.template, data);
      var mailOptions = {
          from: "release_delivery 自动发版系统 <release_delivery@lightinthebox.com>", // sender address
          to: data.contacts, // list of receivers
          bcc : 'litb.ria@gmail.com',
          subject: data.title, // Subject line
          text: "", // plaintext body
          html: html // html body,
      }
      sendmail.sendMail(mailOptions, function(value,flag){
        show_exit(flag, value);
      });
    }

    getMd5sumByshell(filepath, md5Cb);
    
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
    var command = 'sh ' + __dirname + '/batch/git_update.sh ' + dirConfig['git-dir'] + ' ' + data.data;
    last = exec(command);
    last.stdout.on('data', function (data) {
        socket.emit('git_renew',{'result': data})
    });

    last.on('close', function (code) {
        show_exit(code, actionType);
    });
  });

  socket.on('choose', function(){
    var existFile = fs.readdirSync(dirConfig['download-dir']);
    socket.emit('file_list',{'result': existFile});
  });
});


//add file watcher
fs.watch(__dirname  + '/config/', function (event, filename) {
  console.log('event is: ' + event);
  if (filename) {
    console.log('filename provided: ' + filename);
  } else {
    console.log('filename not provided');
  }
  dirConfig = readConfig(__dirname  + '/config/dir.json');
  mailConfig = readConfig(__dirname + '/config/maillist.json');
  console.log(dirConfig,mailConfig);
});