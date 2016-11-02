#!/usr/bin/env node

var currentdate = new Date();
var min = currentdate.getMinutes();
console.log('min='+min/10);
console.log('min1='+Math.floor(min/10));
