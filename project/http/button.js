var socket;
var firstconnect = true;
var state;
//var ctx = document.getElementById('coffee').getContext('2d');
function test(){
    socket.emit('led1',{state:1});
    status_update('change');
    socket.on("image",function(image,buffer){
        if(image){
            console.log("image:from client side");
            var img = new Image();
            img.src = 'data:jpeg.base64,'+buffer;
            ctx.drawImage(img,0,0);
        }
    
    });
}

connect();



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
