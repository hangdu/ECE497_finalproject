#!/usr/bin/node
// From Getting Started With node.js and socket.io 
// http://codehenge.net/blog/2011/12/getting-started-with-node-js-and-socket-io-v0-7-part-2/
// This is a general server for the various web frontends
// buttonBox, ioPlot, realtimeDemo
"use strict";


var port = 9090, // Port to listen on
    bus = '/dev/i2c-2',
    busNum = 2,     // i2c bus number
    i2cNum = 0,             // Remembers the address of the last request
    http = require('http'),
    url = require('url'),
    fs = require('fs'),
    b = require('bonescript'),
    child_process = require('child_process'),
    cr = require('crontab'),
    server,
    connectCount = 0,	// Number of connections to server
    picturecount = 0,
    errCount = 0;	// Counts the AIN errors.
//  Audio
    var frameCount = 0,     // Counts the frames from arecord
        lastFrame = 0,      // Last frame sent to browser
        audioData,          // all data from arecord is saved here and sent
			                // to the client when requested.
        audioChild = 0,     // Process for arecord
        audioRate = 8000;
        
        // PWM
        var pwm = 'P9_21';

var ds18b20 = require('ds18b20');
var emailadd;
var sensorid;
var flag = false;
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport('smtps://bbbcoffeepot%40gmail.com:ece497change@smtp.gmail.com');

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"BBB" <bbbcoffeepot@gmail.com>', // sender address
    to: 'duh2@rose-hulman.edu', // list of receivers
    
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ?', // plaintext body
    html: '<b>Hello world ?</b>' // html body
};
//mailOptions.to = 'test@rose-hulman.edu';
b.pinMode('USR3',b.OUTPUT);

// Initialize various IO things.
function initIO() {
    // Make sure gpios 7 and 20 are available.
    b.pinMode('P9_42', b.INPUT);
    b.pinMode('P9_41', b.INPUT);
    b.pinMode(pwm,     b.ANALOG_OUTPUT);    // PWM



    
    // Initialize pwm
}

function send404(res) {
    res.writeHead(404);
    res.write('404');
    res.end();
}

initIO();

server = http.createServer(function (req, res) {
// server code
    var path = url.parse(req.url).pathname;
    console.log("path: " + path);
    if (path === '/') {
        path = '/button.html';
    }

    fs.readFile(__dirname + path, function (err, data) {
        if (err) {return send404(res); }
//            console.log("path2: " + path);
        res.write(data, 'utf8');
        res.end();
    });
});

server.listen(port);
console.log("Listening on " + port);

// socket.io, I choose you
var io = require('socket.io').listen(server);
io.set('log level', 2);
var socket1;
ds18b20.sensors(function(err,id){
    sensorid = id;
    console.log('sensorid='+sensorid);
});

io.sockets.on('connection', function (socket) {
    socket1 = socket;
    console.log("Connection " + socket.id + " accepted.");
    socket.emit('news',{hello:'world'});
    socket.on('my other event',function(params){
        console.log('receive my other event='+params.dis);
    });


    socket.on('led1',function(state){
        console.log('buton is clicked');
       // b.digitalWrite('USR3',b.HIGH);
        if(picturecount == 0){
        
             child_process.exec('v4l2grab -W 320 -H 240 -o test0.JPEG',piccallback);
        }else if(picturecount == 1){
            
            child_process.exec('v4l2grab -W 320 -H 240 -o test1.JPEG',piccallback);
        }else if(picturecount == 2){
            
            child_process.exec('v4l2grab -W 320 -H 240 -o test2.JPEG',piccallback);
        }else{
            console.log('sth is wrong');
        }

   
    });


    socket.on('email',function(param){
        console.log('receive email signal');
        console.log(param.emailadd);
        emailadd = param.emailadd;
         
        mailOptions.to = param.emailadd;
        sendemail();
    });
    socket.on('coffeeon',function(param){
            console.log(param);
            console.log(param.time);
            var str = ""+param.time;
            var res = str.split(":");
            var hour = res[0];
            var min = res[1];
            console.log('hour='+hour);
            console.log('min='+min);
            //delete previous task
            

            child_process.exec('crontab -r',function(error,stout,sterr){
                if(error == null){
                     console.log('crontab -r success');
                }
            });
            //set new task
            var hour1 = parseInt(hour)+5;
            console.log('hour1=hour+4='+hour1);
            if(hour1>=24){
                hour1 = hour1-24;
            }
            console.log('hour1='+hour1);


            require('crontab').load(function(err,crontab){
                 var job = crontab.create('cd /sys/class/gpio/gpio31 && echo 1 > value');
                 job.minute().at(min);
                 job.hour().at(hour1);
                crontab.save(function(err,crontab){
                     if(err == null){
                         console.log('save ok');
                     }
                 });


            });

    });

    tempcallback(socket);
//get temp data every 30s
    setInterval(function(){
        tempcallback(socket);
    },10000);



    setInterval(readADC, 1000);




    socket.on('disconnect', function () {
        console.log("Connection " + socket.id + " terminated.");
        connectCount--;
        console.log("connectCount = " + connectCount);
    });

    connectCount++;
    console.log("connectCount = " + connectCount);
});




function piccallback(error,stout,sterr){
    if(!error){
        console.log('picture is taken');

        //fs.readFile('test.JPEG',function(err,buf,count){
          //  socket1.emit('image',{image: true,buffer:buf.toString('base64'),count:picturecount});
           // console.log('image file is sent from the server');
         //   console.log('buffer  '+buf.toString('base64'));
          //  console.log('picturecount='+picturecount);
      //  });

         socket1.emit('image',{count:picturecount});
        console.log('image file is sent from the server');
         //   console.log('buffer  '+buf.toString('base64'));
         console.log('picturecount='+picturecount);
        picturecount = picturecount+1;
        if(3 == picturecount){
            picturecount = 0;
        }
    }
}




function tempcallback(socket){

     ds18b20.temperature(sensorid,function(err,value){
         console.log('temp='+value);
         socket.emit('temp',{temp:value});
     
     });

}


function readADC(x){
    var ADCV = b.analogRead('P9_36');
    console.log('ADC_value='+ADCV);

    if(flag&&ADCV>0.7){
        console.log('send email!!!');
        flag = false;
//        sendemail();
    }
    if(!flag&&ADCV<0.7){
        flag = true;
    }
}


function sendemail(){
// send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
         if(error){
             return console.log(error);
          }
         console.log('Message sent: ' + info.response);
    });

}
