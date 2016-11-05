cd /lib/firmware
echo BB-W1-P9.12 > $SLOTS
cat $SLOTS

cd /sys/class/gpio/gpio31
echo out > direction
