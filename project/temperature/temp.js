#!/usr/bin/env node
var ds18b20 = require('ds18b20');
var sensorid;
ds18b20.sensors(function(err,id){
    sensorid = id;
    console.log('id='+id);
    ds18b20.temperature(sensorid,function(err,value){
        console.log('temp='+value);
    });
});
