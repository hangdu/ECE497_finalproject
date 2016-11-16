We have a wiki-page for this project.
Here is the link:
http://elinux.org/ECE497_Project_Coffee_Pot_Control

Overview

Our project is to use the BBB to create a web interface for a common home coffee pot. Our web interface should allow users to schedule brew times, see a photo of the current coffee pot, see the temperature of the liquid; additionally the BBB should turn off the coffee pot when it is running dangerously low to avoid sludge at the bottom of the pot and notify the user via email when the pot should be refilled .

Currently, our project accomplishes the goal of allowing users to schedule brew times, see a photo of the coffee pot, and plot the temperature all from a web interface.

Currently, our project does not accomplish the goal of notifying the user when the pot is running low and turning off the pot. We cannot accomplish this because the Sparkfun pressure sensor that we used to determine how much liquid is in the pot cannot withstand the heat of the burner.

In fine , this project demonstrates the ease at which a maker can automate their environment. The BBB's ability to simplify GPIO and I2C interfaces along with node js's extensive repository modules makes interacting with the outside world simple.



Install instruction:

The first time:

1.set environment variable

vim ~/.bash_profile

add the following lines to the end of the file:

export SLOTS=/sys/devices/platform/bone_capemgr/slots

export DTS=/opt/source/bb.org-overlays/src/arm

exit beaglebone and login again export The result should include SLOTS and DTS.


2.install something (install.sh and setup.sh files are missing.)

git clone https://github.com/hangdu/ECE497_finalproject.git

npm install ds18b20

npm install http

npm install fs

npm install child_process

npm install crontab

npm install nodemailer

npm install socket.io

install v4l2grab:

git clone https://github.com/twam/v4l2grab.git

make (This doesn't work for me.)


3.1 for the camera to work

connect the camera to the beaglebone with USB

check /dev/vedio0 is showed

test camera using the command

v4l2grab -W 160 -H 120 -o test.JPEG


3.2 for temperature sensor to work

check the hardware connection

vim /boot/uEnv.txt

make sure HDMI is disabled and eMMC is enabled

cd $DTS

vim univ-emmc-00A0.dts

uncomment all things related to P9_12

cd ../../

make

cp ./src/arm/univ-emmc-00A0.dtbo /lib/firmware

cd /lib/firmware

echo BB-W1-P9.12 > $SLOTS

cat $SLOTS

to check BB-W1-P9.12 is loaded. 

cd /sys/bus/w1/devices

ls

cd 28-000008291724

28-000008291724 is the id of the temperature sensor. Every temperature sensor has a its own id. So be sure to check that and go to that directory.

cat w1_slave

then the temperature will be showed.


3.3 for scheduling time to turn on coffee pot to work

on host computer(run specific shell):

cd BeagleBoard-exercise/setup

./firstssh.sh

on beaglebone(check the time is OK):

date


4.export gpio31

cd /sys/class/gpio

ls

to check if gpio31 appears(GPIO31 pin is used to connect the coffee pot)

otherwise

echo gpio31 > export


5.run Server

cd ECE497_finalproject/project/http

./setup.sh

./boneServer.js (I get an error.)


6.open client

Go to the browser and go to 192.168.7.2:9090


Later:

You only need to start from step5 and step6. 
