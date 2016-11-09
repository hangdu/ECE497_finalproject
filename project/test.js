#!/usr/bin/env node
var b = require('bonescript');
var process = require('child_process');
var button  = 'P9_41'
var relaySig = 'P9_42'
var SigMode = 0;
b.pinMode(relaySig, b.OUTPUT,7,'pulldown');
b.pinMode(button,b.INPUT,7,'pulldown');
b.digitalWrite(relaySig, SigMode);

b.attachInterrupt(button,true,b.RISING,buttonClick);

function buttonClick(){
    setTimeout(swRelay(),500);
};
function swRelay(){
    SigMode = SigMode ? 0 : 1;
    b.digitalWrite(relaySig,SigMode);
    console.log(SigMode);
            };
}
