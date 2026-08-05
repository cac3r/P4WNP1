
Extraction of:

- Local data
- SAM, System and Security files
- User Desktop, Documents, ... files

Using:

- Raspberry Pi zero W with P4wnP1 A.L.O.A
- Data extraction script (all_in_one.js)
- Storage: Pi microSD (USB mass storage)
- microUSB <-> USB-A *DATA* cable
- (NO BATTERY)


Target:

- Real Windows 10 machine with dafault and standard security configuration (Controlled, authorized)

### Settings

Device configuration:

1. Power up the Pi zero W
2. Connect via wifi
3. Access the Web UI

USB SETTINGS
![[USB_CONFIG.png|292]]

1. Enable:
	- Keyboard
	- Mouse
	- Mass Storage
2. Click on Mass Storage `...` button:
![[mass_store_bin.png|343]]
- Select default `test.bin`

3. STORE (as `def_mass_storage`)



HIDSCRIPT

1. Paste `all_in_one.js` 
2. Edit the script GLOBAL SETTINGS:
	- layout (us)
	- run_as_admin=true                    (Needed for "SAM dump")
	- extract_to_ssd=false                   (Use Pi mass storage)
	- hide=false                                     (just to show case. Set to true on real scenarios)
	- exit=false                                      (same as hide)
	- modify_defender=false              (trivial in this case)
	- var usb_drive = "README"         (Name of the flashdrive on `test.bin`)
	- extract_files=true                         (Extract User files function)
	- user folders -> Documents, Desktop, Pictures, Downloads
	- filetypes -> "pdf", "txt"               (normally add more but this is enough for demo)
	- sam=true
	- mimikatz=false                            (flagged by AV / AMSI)
	- extract_local_recon_data=true  (Just local, no domain)
3. STORE (as `all_in_one(lr-sd-uf-2pisd).js`) (lr=local recon, sd=sam dump, uf=user files, 2pisd= To Pi microSD)


TRIGGER ACTIONS

1.  + ADD ONE
	- Enabled
	- One Shot  (not permanent, just one time execution)
	- Trigger = Service Started (on boot)
	- Action = Start a HID script
	- Script Name = `all_in_one(lr-sd-uf-2pisd).js`
	- UPDATE
2. STORE (as `onboot_all_in_one(lr-sd-uf-2pisd)`)

![[TRIGGER_ACTIONS.png]]


GENERIC SETTINGS

1. TriggerActions Template = `onboot_all_in_one(lr-sd-uf-2pisd)`
2. USB Template = `def_mass_storage`
3. WiFi Template = `startup`  (default, to connect back afterwards)
4. STORE (as `onboot_all_in_one(lr-sd-uf-2pisd)_MT`)  (MT = Master Template)
5. Startup Master Template = `onboot_all_in_one(lr-sd-uf-2pisd)_MT`
6. DEPLOY (Optional to make sure the MT is loaded)

![[MT_SETTINGS.png]]

Device is Ready

GENERIC SETTINGS > System > SHUTDOWN


### Demo

Plugging the Pi USB in (Connected to DATA port) to the target computer and waiting for the script to finish. I set a timer to see how "slow" it is without a battery. The device has to boot, open the flashdrive and run the script.

![[USB_ATTCK_DEMO.mp4]]
- *(**Screen goes black** when the window pops up asking whether you are sure to run PS as administrator. Its just a OBS / recording minor fault)*
- *(Showing the terminal on purpose for demo. On a real scenario the `hide` parameter would be set to true to hide the window)*

It takes around 1 minute from plug to finish.

In this demo I ejected the mounted flashdrive (README) to make it clean. On realistic scenarios this is probably not the case. When doing straight unplugging tests sometimes the data comes out broken, leaving SAM and other files unusable. User files and recon data is also broken but txt files can be reconstructed without much effort.

---

Now to read the data back on the attacker system:

Power the Pi with PWR IN. Connect to it via wifi. 
Set benign Master Template to read:
- Trigger Action = `startup` (default)
- USB Settings = `def_mass_storage` (to expose the flashdrive)
- WiFi = `startup` (default)
- STORE (as `read_pisd_MT`)
- LOAD it

![[read_pisd_mt.png]]

Now connect the Pi to the attacker computer via data port and deploy it.
Mount the README drive
List content

```
tree '/media/xvn/README/loot_(02-08-2026_10-41)'
```

![[loot_tree.png|374]]

Loot:
- `TCP_IP_Illustrated.pdf`, `stm.txt`, `w.txt`, `piW.pdf`  ->  User Files
- `local_*.txt`  ->  Files containing the output from executed local recon commands
- windows_credentials/  ->  SAM, System, Security


Local recon output files examples:

`local_ports.txt`

![[local_ports.png]]


`local_whoami.txt`

![[local_whoami.png]]

All commands executed and saved the output correctly. 

The SAM, Security and System files can be used to potentially dump local hashes with `secretsdump.py` from impacket. In my case I could only retrieve DPAPI keys. (A future DPAPI files extraction HID script would be useful)