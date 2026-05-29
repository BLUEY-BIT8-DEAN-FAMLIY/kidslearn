Dim shell, fs
Set shell = CreateObject("WScript.Shell")
Set fs = CreateObject("Scripting.FileSystemObject")

Dim node, appDir, appUrl
node = "C:\Program Files\nodejs\node.exe"
appDir = "C:\Users\97252\GAME3"
appUrl = "http://localhost:3001"

' Kill previous node instances silently so we start from a clean state
shell.Run "taskkill /F /IM node.exe", 0, True
WScript.Sleep 500

' Start the full Express server (it serves both the API and the built React client) - hidden
shell.Run Chr(34) & node & Chr(34) & " " & Chr(34) & appDir & "\server\index.js" & Chr(34), 0, False

' Wait for the server to be ready before launching the browser window
WScript.Sleep 2500

' Open in Edge app mode (single window, no tabs/address bar - looks like a real app)
Dim edgePaths(1), opened, i
edgePaths(0) = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
edgePaths(1) = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
opened = False
For i = 0 To 1
    If fs.FileExists(edgePaths(i)) Then
        shell.Run Chr(34) & edgePaths(i) & Chr(34) & " --app=" & appUrl & " --window-size=1200,860", 1, False
        opened = True
        Exit For
    End If
Next

' Fallback: try Chrome in app mode
If Not opened Then
    Dim chromePaths(1)
    chromePaths(0) = "C:\Program Files\Google\Chrome\Application\chrome.exe"
    chromePaths(1) = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    For i = 0 To 1
        If fs.FileExists(chromePaths(i)) Then
            shell.Run Chr(34) & chromePaths(i) & Chr(34) & " --app=" & appUrl & " --window-size=1200,860", 1, False
            opened = True
            Exit For
        End If
    Next
End If

' Last-resort fallback - default browser (only if neither Edge nor Chrome found)
If Not opened Then
    shell.Run appUrl
End If
