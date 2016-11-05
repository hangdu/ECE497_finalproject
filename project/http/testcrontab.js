#!/usr/bin/env node
var cr = require('crontab');
require('crontab').load(function(err,crontab){
   var job = crontab.create('cd /sys/class/gpio/gpio31 && echo 1 > value');
  job.minute().at(33);

    crontab.save(function(err,crontab){
        if(err == null){
            console.log('save ok');
         }
    });


});

