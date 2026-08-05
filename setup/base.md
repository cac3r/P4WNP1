
## Components

### Hardware

- Raspberry Pi zero W
- 8 GB microSD card
- MicroUSB <=> USB-A *data* cable

### Software

- P4WNP1 A.L.O.A image
- RPI imager (or similar) to flash the image to microSD



## Setup

### Flash the image 

1. Download the latest image from: https://github.com/RoganDawes/P4wnP1_aloa/releases
2. Insert the microSD card to your computer (SD card, USB adapter, ...)
3. Open rpi imager > Select custom > `<p4wnp1.img>` 
4. Select the microSD card
5. Flash it
6. Wait till it finishes, unmount and disconnect the microSD card


### First boot

1. Connect the microSD card to the Raspberry Pi zero W
2. Power it up (PWR IN or DATA female microUSB port)
3. On another computer/device check WiFi APs
4. The AP should be clear, contains emojies and `P4WNP1`
5. Introduce the password (check repo: https://github.com/RoganDawes/P4wnP1_aloa#0-how-to-install)
6. Access the Web UI at `http://172.24.0.1:8000`
7. Can also connect via ssh: `ssh root@172.24.0.1`
8. Base system is complete



## Configuration

### Automatic HID script execution on boot example

##### 1. Create a USB Settings template
- enable USB Gadget
- enable keyboard, mouse
- optionally enable USB mass storage

Save USB Settings template

##### 2. Create a Trigger action template
 - enable
 - only once
 - HID script
 - `<script>.js`

Save trigger template

##### 3. Create a master template
- Select trigger template: X
- Select usb template: def (default just keyboard on)
- Select wifi template: startup (default to access via wifi afterwards)

Save master template

Make sure everything is set and load master template for startup. 

