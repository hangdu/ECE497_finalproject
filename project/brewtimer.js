#!/usr/bin/env node
var alarmHrs = 3;
var alarmMins = 44;
var check = setInterval(checkTime() , 1000);

function checkTime(x){
    date = new Date();
    var hours = date.getHours();
    var mins = date.getMinutes();
    var secs = date.getSeconds();
    console.log(hours + ":" + mins + ":" + secs);
    // if(hours === alarmHrs  && mins>alarmMins){
    //     console.log("BRAAAP");
    // };
    
 
}




