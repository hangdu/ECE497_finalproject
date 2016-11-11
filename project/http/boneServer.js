#!/usr/bin/node
// From Getting Started With node.js and socket.io 
// http://codehenge.net/blog/2011/12/getting-started-with-node-js-and-socket-io-v0-7-part-2/
// This is a general server for the various web frontends
// buttonBox, ioPlot, realtimeDemo
"use strict";
var flagcount=0;
var adcThresh = 0.83;
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

var exec = require('child_process').exec
var nodemailer = require('nodemailer');
var ds18b20 = require('ds18b20');
var sensorid;
var flag = false;

var transporter = nodemailer.createTransport('smtps://bbbcoffeepot%40gmail.com:ece497change@smtp.gmail.com');

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"BBB" <bbbcoffeepot@gmail.com>', // sender address
    to: 'dituccjv@rose-hulman.edu', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ?', // plaintext body
    html: '<b>Hello friend, it seems your coffee pot is running low. You should probably do something about it ?</b>' // html body
};

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
// See https://github.com/LearnBoost/socket.io/wiki/Exposed-events
// for Exposed events

// on a 'connection' event
ds18b20.sensors(function(err,id){
    sensorid = id;
    console.log('sensorid='+sensorid);
});

io.sockets.on('connection', function (socket) {
    socket1 = socket;
    console.log("Connection " + socket.id + " accepted.");
//    console.log("socket: " + socket);

    // now that we have our connected 'socket' object, we can 
    // define its event handlers

    // Send value every time a 'message' is received.
    socket.emit('news',{hello:'world'});
    socket.on('my other event',function(params){
        console.log('receive my other event='+params.dis);
    });

    socket.on('ain', function (ainNum) {
        b.analogRead(ainNum, function(x) {
            if(x.err && errCount++<5) console.log("AIN read error");
            if(typeof x.value !== 'number' || x.value === "NaN") {
                console.log('x.value = ' + x.value);
            } else {
                socket.emit('ain', {pin:ainNum, value:x.value});
            }
//            if(ainNum === "P9_38") {
//                console.log('emitted ain: ' + x.value + ', ' + ainNum);
//            }
        });
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
    },30000);



    setInterval(readADC, 10000);
    socket.on('gpio', function (gpioNum) {
//    console.log('gpio' + gpioNum);
        b.digitalRead(gpioNum, function(x) {
            if (x.err) throw x.err;
            socket.emit('gpio', {pin:gpioNum, value:x.value});
//            console.log('emitted gpio: ' + x.value + ', ' + gpioNum);
        });
    });

    socket.on('i2c', function (i2cNum) {
        console.log('Got i2c request:' + i2cNum);
        child_process.exec('i2cget -y ' + busNum + ' ' + i2cNum + ' 0 w',
            function (error, stdout, stderr) {
//     The TMP102 returns a 12 bit value with the digits swapped
                stdout = '0x' + stdout.substring(4,6) + stdout.substring(2,4);
//                console.log('i2cget: "' + stdout + '"');
                if(error) { console.log('error: ' + error); }
                if(stderr) {console.log('stderr: ' + stderr); }
                socket.emit('i2c', stdout);
            });
    });

    socket.on('led', function (ledNum) {
        var ledPath = "/sys/class/leds/beaglebone:green:usr" + ledNum + "/brightness";
//        console.log('LED: ' + ledPath);
        fs.readFile(ledPath, 'utf8', function (err, data) {
            if(err) throw err;
            data = data.substring(0,1) === "1" ? "0" : "1";
//            console.log("LED%d: %s", ledNum, data);
            fs.writeFile(ledPath, data);
        });
    });

    function trigger(arg) {
        var ledPath = "/sys/class/leds/beaglebone:green:usr";
//    console.log("trigger: " + arg);
	    arg = arg.split(" ");
	    for(var i=0; i<4; i++) {
//	    console.log(" trigger: ", arg[i]);
	        fs.writeFile(ledPath + i + "/trigger", arg[i]);
	    }
    }
    
    socket.on('trigger', function(trig) {
//	console.log('trigger: ' + trig);
	    if(trig) {
            trigger("heartbeat mmc0 cpu0 none");
        } else {
            trigger("none none none none");
        }
    });
    
    // Send a packet of data every time a 'audio' is received.
    socket.on('audio', function () {
//        console.log("Received message: " + message + 
//            " - from client " + socket.id);
        if(audioChild === 0) {
            startAudio();
        }
        socket.emit('audio', sendAudio() );
    });
    
    socket.on('matrix.bs', function (i2cNum) {
        var i;
        var line = new Array(16);
        // console.log('Got i2c request:' + i2cNum);
        b.i2cOpen(bus, 0x70);
        for(i=0; i<16; i++) {
            // Can only read one byte at a time.  Something's wrong
            line[i] = b.i2cReadBytes(bus, i, 1)[0].toString(16);
            // console.log("line: " + JSON.stringify(line[i]));
        }
        console.log(line.join(' '));
        socket.emit('matrix', line.join(' '));
    });
    
    socket.on('matrix.wire', function (i2cNum) {
        var i;
        var line = new Array(16);
        // console.log('Got i2c request:' + i2cNum);
        b.i2cOpen(bus, 0x70);
        for(i=0; i<16; i++) {
            // Can only read one byte at a time.  Something's wrong
            line[i] = b.i2cReadBytes(bus, i, 1)[0].toString(16);
            // console.log("line: " + JSON.stringify(line[i]));
        }
        console.log(line.join(' '));
        socket.emit('matrix', line.join(' '));
    });
    
    socket.on('matrix', function (i2cNum) {
//        console.log('Got i2c request:' + i2cNum);
        child_process.exec('i2cdump -y -r 0x00-0x0f ' + busNum + ' ' + i2cNum + ' b',
            function (error, stdout, stderr) {
//      The LED has 8 16-bit values
//                console.log('i2cget: "' + stdout + '"');
		var lines = stdout.split("00: ");
		// Get the last line of the output and send the string
		lines = lines[1].substr(0,47);
		console.log("lines = %s", lines);
                socket.emit('matrix', lines);
                if(error) { console.log('error: ' + error); }
                if(stderr) {console.log('stderr: ' + stderr); }
            });
    });
    
    // Sets one column every time i2cset is received.
    socket.on('i2cset.bs', function(params) {
        // console.log(params);
        if(params.i2cNum !== i2cNum) {
            i2cNum = params.i2cNum;
            console.log("i2cset: Opening " + i2cNum);
    	    b.i2cOpen(bus, i2cNum);
        }
    	b.i2cWriteBytes(bus, params.i, [params.disp]);
    });
    
    socket.on('i2cset', function(params) {
        console.log('socket on:i2cset value i is'+params.i);
	// Double i since display has 2 bytes per LED
	child_process.exec('i2cset -y ' + busNum + ' ' + params.i2cNum + ' ' + params.i + ' ' +
		params.disp); 
    });
    
    socket.on('slider', function(slideNum, value) {
        console.log('slider' + slideNum + " = " + value);
        b.analogWrite(pwm, value/5, 80);
    });

    socket.on('disconnect', function () {
        console.log("Connection " + socket.id + " terminated.");
        connectCount--;
        console.log("connectCount = " + connectCount);
    });

    connectCount++;
    console.log("connectCount = " + connectCount);
});

function sendAudio() {
//        console.log("Sending data");
    if(frameCount === lastFrame) {
//            console.log("Already sent frame " + lastFrame);
    } else {
        lastFrame = frameCount;
    }
    return(audioData);
}

function startAudio(){
    try {
        console.log("process.platform: " + process.platform);
        if(process.platform !== "darwin") {
        audioChild = child_process.spawn(
           "/usr/bin/arecord",
           [
            "-Dplughw:1,0",
            "-c2", "-r"+audioRate, "-fU8", "-traw", 
            "--buffer-size=800", "--period-size=800", "-N"
           ]
        );
        } else {
        audioChild = child_process.spawn(
           "/Users/yoder/bin/sox-14.4.0/rec",
           [
            "-c2", "-r44100", "-tu8",  
            "--buffer", "1600", "-q", "-"
           ]
        );

        }
//        console.log("arecord started");
        audioChild.stdout.setEncoding('base64');
        audioChild.stdout.on('data', function(data) {
            // Save data read from arecord in globalData
            audioData = data;
            frameCount++;
        });
        audioChild.stderr.on('data', function(data) {
            console.log("arecord: " + data);
        });
        audioChild.on('exit', function(code) {
            console.log("arecord exited with: " + code);
        });
    } catch(err) {
        console.log("arecord error: " + err);
    }
}

function timeoutcallback(socket){
    
        console.log('function timeoutcallback');
        fs.readFile('test.JPEG',function(err,buf,count){
            socket.emit('image',{image: true,buffer:buf.toString('base64'),count:picturecount});
            console.log('image file is sent from the server');
            console.log('buffer  '+buf.toString('base64'));
            console.log('picturecount='+picturecount);
        });
        picturecount = picturecount+1;
        if(3 == picturecount){
            picturecount = 0;
        }

}

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

    if(flag&&ADCV>adcThresh){
	flagcount++;
	if(flagcount>10){
            console.log('send email!!!');
            flag = false;
            sendemail();
            exec('cd /sys/class/gpio/gpio31 && echo 0 > value');
	    flagcount=0;
	}}
    if(!flag&&ADCV<adcThresh){
        flag = true;
	flagcount=0;
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
