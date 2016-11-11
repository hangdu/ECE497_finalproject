cd /lib/firmware
echo BB-W1-P9.12 > $SLOTS
echo BB-ADC > $SLOTS
cat $SLOTS

cd /sys/class/gpio/gpio31
echo out > direction

