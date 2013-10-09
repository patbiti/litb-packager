var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , exec = require('child_process').exec
  , readConfig = require('./util/readConfig')
  , sendmail = require('./util/sendmail')
  , dirConfig
  , Mustache = require('mustache')
  , mailConfig;

//init params
dirConfig = readConfig(__dirname  + '/config/dir.json');
mailConfig = readConfig(__dirname + '/config/maillist.json');

server.listen(9527);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/static/index.html');
});



io.sockets.on('connection', function (socket) {
  function show_exit(code, actionType){
    var result = {'result': ('子进程已关闭，代码：' + code)};
    if(actionType){
      result.actionType = actionType;
    }
    socket.emit('exit_info', result);
  }

  socket.on('packager', function(data){
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
    }else{
      var command = 'sh ' + __dirname + '/batch/packager.sh ' + data.branch + ' ' + data.packagerno + ' ' + '' || data.comments;
      last = exec(command);
      
      last.stdout.on('data', function (data) {
          socket.emit('packager_result',{'result': data})
      });

      last.on('exit', function (code) {
        socket.emit('packager_over',{
          'mailcontact' : mailConfig.contacts,
          'template' : mailConfig.template,
          'type' : data.type
        })
        show_exit(code, actionType);
      });
    }
    
  });

  socket.on('sendmail', function(arr){
    var data = {};
    for(var i = 0; i < arr.length; i++){
      if(data[arr[i].name]){
        data[arr[i].name] = data[arr[i].name] + ', '+ arr[i].value; 
      }else{
        data[arr[i].name] = arr[i].value; 
      }
    }
    var actionType = 'send email';
    data.isQA = data.testtype.indexOf('功能测试')>-1 ? true : false;
    data.isUI = data.testtype.indexOf('UI测试')>-1 ? true : false;
    console.log(dirConfig)
    data.url = dirConfig['request-url'];
    data.tagname = data.tagname;
    var html = Mustache.render(mailConfig.template, data);
    var mailOptions = {
        from: "litb-packager✔ <litb.ria@gmail.com>", // sender address
        to: data.contacts, // list of receivers
        subject: data.title, // Subject line
        text: "", // plaintext body
        html: html // html body
    }
    sendmail.sendMail(mailOptions, function(value){
      show_exit(0, value);
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
    var command = 'sh ' + __dirname + '/batch/git_update.sh ' + dirConfig['git-dir'] + ' ' + data.data;
    last = exec(command);
    last.stdout.on('data', function (data) {
        socket.emit('git_renew',{'result': data})
    });

    last.on('exit', function (code) {
        show_exit(code, actionType);
    });
  });

  socket.on('choose', function(){
    var existFile = fs.readdirSync(dirConfig['download-dir']);
    socket.emit('file_list',{'result': existFile});
  });
});