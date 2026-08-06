## P4WNP1 A.L.O.A

[P4WNP1 A.L.O.A](https://github.com/RoganDawes/P4wnP1_aloa) is a physical access framework created for the Raspberry Pi zero W. A common use is simulating a keyboard device to run HID scripts when its plugged in to a target machine. Similar concept of Bad-USB, rubber ducky, ... but way cheaper.

This repo `P4WNP1` contains the basic setup and some ready to use payloads, as well as a demonstration on how it looks like and how much time it takes to run on a specific context.

### CONTENT

- `demo/` contains a demonstration on running a HID script for data extraction out of a windows 10 machine.
- `hid_scripts/` contains some JS scripts ready to load to the P4WNP1 and use.
- `setup/` contains basic setup and configuration of the P4WNP1 , as well as a build to disguise the device.
- `assets/` Ignore, just contains media files.

### ACKNOWLEGEMENT

- The JS scripts in this repo were made using chriskalv's ["AllinOne_extraction.js"](https://github.com/chriskalv/p4wnp1_payloads/blob/main/AllinOne_extraction.js) as a base. Most of the logic is reused.

---

##### DISCLAIMER

This project demonstrates a physical attack scenario conducted exclusively on hardware 
and infrastructure I own and control. It is intended 
for educational and security research purposes only.

Do not use this gadgets, frameworks and scripts on systems, devices, or networks you do not own or have explicit permission to test.
