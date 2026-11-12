The **Windows Registry** is the hierarchical configuration database that stores system and application settings for the OS, drivers, services, and user profiles. It replaced the old `.ini` and `config.sys` files starting with Windows 95.
## Structure

| Level | Role |
|---|---|
| **Hive** | Top-level container (e.g., `HKLM`, `HKCU`) |
| **Key** | Folder-like path inside a hive |
| **Subkey** | Nested key |
| **Value** | The actual setting (name + type + data) |
### Five root hives

| Hive | Abbreviation | Purpose |
|---|---|---|
| `HKEY_LOCAL_MACHINE` | **HKLM** | Machine-wide settings (hardware, OS, installed software) |
| `HKEY_CURRENT_USER` | **HKCU** | Settings for the currently logged-in user |
| `HKEY_USERS` | **HKU** | All loaded user profiles |
| `HKEY_CLASSES_ROOT` | **HKCR** | File associations & COM objects (merged view of HKLM+HKCU) |
| `HKEY_CURRENT_CONFIG` | **HKCC** | Current hardware profile |

## On-disk location

System hives live in `C:\Windows\System32\config\` as extensionless binary files (`SYSTEM`, `SOFTWARE`, `SAM`, `SECURITY`, `DEFAULT`). The current user's hive is `C:\Users\<username>\NTUSER.DAT`.

## Tools

- **`regedit.exe`** — the GUI editor; launch via `Win+R` → `regedit`. Use **File → Export** to back up a key before editing.
- **`reg.exe`** — the CLI tool (covered in the previous answer).

## Common value types

`REG_SZ` (string), `REG_DWORD` (32-bit number), `REG_MULTI_SZ` (multi-string), `REG_BINARY`, `REG_EXPAND_SZ` (expandable string).

> **Caution:** A single wrong edit can break sign-in, services, or startup. Always export the key first and change one value at a time.   

