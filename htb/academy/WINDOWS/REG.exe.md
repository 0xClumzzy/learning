# `reg.exe` - The Windows Registry Console Tool

`reg.exe` is a **built-in command-line tool** that lets you read and modify the Windows Registry without opening the graphical `regedit.exe`.  If you're comfortable typing in a terminal, it's often faster and more scriptable than clicking through the GUI.

---

## Where to find it

| Item                | Detail                                            |
| ------------------- | ------------------------------------------------- |
| **Path**            | `C:\Windows\System32\reg.exe`                     |
| **32-bit copy**     | `C:\Windows\SysWOW64\reg.exe` (on 64-bit Windows) |
| **Available since** | Windows 2000                                      |
| **Works on**        | Windows XP → Windows 11, all Server editions      |
>  **Tip:** Type `reg /?` in the terminal to see the built-in help with all syntax at any time. 

---

## How to open Command Prompt

1. Press **Win + R**, type `cmd`, hit **Enter**. 
2. For changes that affect the whole system (HKLM), right-click **Start → Terminal (Admin)** or **Command Prompt (Admin)**. 

---

## The five root hives you'll use

These abbreviations are used at the start of every registry path:

| Abbreviation | Full Name | What it stores |
|---|---|---|
| `HKLM` | `HKEY_LOCAL_MACHINE` | System-wide settings (hardware, installed programs) |
| `HKCU` | `HKEY_CURRENT_USER` | Settings for *your* user account |
| `HKU` | `HKEY_USERS` | All user profiles on the machine |
| `HKCR` | `HKEY_CLASSES_ROOT` | File type associations & COM objects |
| `HKCC` | `HKEY_CURRENT_CONFIG` | Current hardware profile |

A full path looks like: `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion`

---

## All subcommands at a glance

| Subcommand | What it does (in plain English) |
|---|---|
| `reg query` | **Read** — show you what's in a key or value |
| `reg add` | **Create or update** a key or value |
| `reg delete` | **Remove** a key or value |
| `reg copy` | **Duplicate** a key to another location |
| `reg export` | **Save** a key to a `.reg` text file (backup!) |
| `reg import` | **Load** a `.reg` text file back into the registry |
| `reg save` | **Save** a key to a binary `.hiv` file |
| `reg restore` | **Restore** a binary `.hiv` file back into the registry |
| `reg load` | **Mount** a hive file under a temporary key |
| `reg unload` | **Unmount** a hive file that was loaded |
| `reg compare` | **Diff** two keys and show what's different |

---

## Step-by-step: each subcommand with examples

### 1. `reg query` — Read registry data

This is the safest command. It only *reads*; it never changes anything. 

```cmd
:: Show everything under a key
reg query HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion

:: Show only one specific value
reg query HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion /v ProgramFilesDir

:: Show the (Default) value of a key
reg query HKCU\Software\Microsoft\Windows\CurrentVersion /ve

:: Recursively show ALL subkeys and values (can be huge!)
reg query HKCU\Software\MyApp /s

:: Search for a value whose data contains a specific string
reg query HKLM\SOFTWARE /f "MyApp" /t REG_SZ /s   