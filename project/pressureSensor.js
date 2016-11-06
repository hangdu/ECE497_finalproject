#!/usr/bin/env node
var b = require('bonescript');

var readtimer = setInterval(readADC, 1000);

function readADC(x) {
    var ADCV = b.analogRead('P9_36');
    console.log('ADC_Value = ' + ADCV);
}
