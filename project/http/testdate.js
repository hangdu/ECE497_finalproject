#!/usr/bin/env node

var currentdate = new Date();
var min = currentdate.getMinutes();
console.log('min='+min/10);
console.log('min1='+Math.floor(min/10));


var hour = "22";
var hour1 = parseInt(hour)+4;
if(hour1>24){
    hour1 = hour1-24;
    console.log('hour1='+hour1);
}
