#!/usr/bin/env node
var b = require('bonescript');
var process = require('child_process');
var button  = 'P9_41'

b.pinMode(button,b.INPUT,7,'pulldown');
b.attachInterrupt(button,true,b.CHANGE,printStatus);
function printStatus(x){
    console.log('x.value='+x.value);
    if(x.value == 1){
        process.exec('v4l2grab -W 160 -H 120 -o test.JPEG');
        console.log('picture taken');
    }
}
