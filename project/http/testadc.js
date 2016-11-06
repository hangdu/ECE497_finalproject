#!/usr/bin/env node

var b = require('bonescript');
b.pinMode('P9_16',b.INPUT);
b.analogRead('P9_16',printStatus);

setInterval(read,500);
function read(x){
    b.analogRead('P9_16',printStatus);
}

function printStatus(x){
    console.log('x.value='+x.value);
}

