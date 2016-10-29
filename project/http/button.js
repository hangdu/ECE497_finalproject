var socket = io();
var firstconnect = true;
var state;
var count = 0;

var i2cNum = "0x70";
var i = 5;
var data = [],
	totalPoints = 300;
	
	
function getRandomData() {

	if (data.length > 0)
		data = data.slice(1);

	// Do a random walk

	while (data.length < totalPoints) {

		var prev = data.length > 0 ? data[data.length - 1] : 50,
			y = prev + Math.random() * 10 - 5;

		if (y < 0) {
			y = 0;
		} else if (y > 100) {
			y = 100;
		}

		data.push(y);
	}

	// Zip the generated y values with the x values

	var res = [];
	for (var i = 0; i < data.length; ++i) {
		res.push([i, data[i]])
	}

	return res;
}

var res = getRandomData();
console.log(res);







// // Add the Flot version string to the footer

// $("#footer").prepend("Flot " + $.plot.version + " &ndash; ");

function test(){
    socket.emit('led1',{state:1});
    status_update('change');
}

socket.on('news',function(data){
    status_update(data);
    socket.emit('my other event',{i2cNum: i2cNum,i:2*i,dis:"test"});
});

socket.on('temp',function(param){
    status_update(param.temp);
})
socket.on('image',function(params){

//    clearcache();
     console.log("image:from client side");
  //   status_update('image');
     
           //  var img = new Image();
            // img.src = 'data:./jpeg;base64,'+buffer;
//             $('#coffee').attr('src','data:image/jpeg;base64,'+buffer);
             
            if(count == 0){
                
//                status_update('count = 0');
                $('#coffee').attr('src','test0.JPEG');
            }else if(count == 1){
  //              status_update('count = 1');
                
                $('#coffee').attr('src','test1.JPEG');
            }else if(count == 2){
    //            status_update('count = 2');
                $('#coffee').attr('src','./test2.JPEG');
            }else{
    //            status_update('new value count='+count);
            }
 //            ctx.drwaImage(img,0,0);
           count++;
           if(count == 3){
                count = 0;
           }
});

//connect();
socket.on('test',function(data){
//    status_update('test');
});

   function connect() {
      if(firstconnect) {
        socket = io.connect(null);

        // See https://github.com/LearnBoost/socket.io/wiki/Exposed-events
        // for Exposed events
        socket.on('message', function(data)
            { status_update("Received: message " + data);});
        socket.on('connect', function()
            { status_update("Connected to Server"); });
        socket.on('disconnect', function()
            { status_update("Disconnected from Server"); });
        socket.on('reconnect', function()
            { status_update("Reconnected to Server"); });
        socket.on('reconnecting', function( nextRetry )
            { status_update("Reconnecting in " + nextRetry/1000 + " s"); });
        socket.on('reconnect_failed', function()
            { message("Reconnect Failed"); });


    /*
	i2c_smbus_write_byte(file, 0x21); 
	i2c_smbus_write_byte(file, 0x81);
	i2c_smbus_write_byte(file, 0xe7);
    */
        // Read display for initial image.  Store in disp[]

        firstconnect = false;
      }
      else {
        socket.socket.reconnect();
      }
    }

function status_update(txt){
    $('#status').html(txt);
}

function clearcache(){
    for(var x in jQuery.cache){
        delete jQuery.cache[x];
    }
}

