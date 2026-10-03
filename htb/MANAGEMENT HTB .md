# RECON 

### port scan and service discovery
```shellsession 
PORT      STATE SERVICE     REASON  VERSION
22/tcp    open  ssh         syn-ack OpenSSH 9.6p1 Ubuntu 3ubuntu13.19 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBN9Ju3bTZsFozwXY1B2KIlEY4BA+RcNM57w4C5EjOw1QegUUyCJoO4TVOKfzy/9kd3WrPEj/FYKT2agja9/PM44=
|   256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH9qI0OvMyp03dAGXR0UPdxw7hjSwMR773Yb9Sne+7vD
80/tcp    open  http        syn-ack nginx 1.24.0 (Ubuntu)
|_http-server-header: nginx/1.24.0 (Ubuntu)
|_http-title: Did not follow redirect to https://management.htb/
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
1689/tcp  open  java-rmi    syn-ack Java RMI
| rmi-dumpregistry:
|   org.opends.server.protocols.jmx.client-unknown
|     javax.management.remote.rmi.RMIServerImpl_Stub
|     @127.0.1.1:32903
|     extends
|       java.rmi.server.RemoteStub
|       extends
|_        java.rmi.server.RemoteObject
4444/tcp  open  ssl/krb524? syn-ack
| ssl-cert: Subject: commonName=sso.management.htb/organizationName=Administration Connector RSA Self-Signed Certificate
| Issuer: commonName=sso.management.htb/organizationName=Administration Connector RSA Self-Signed Certificate
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2026-06-02T01:23:59
| Not valid after:  2046-05-28T01:23:59
| MD5:     f9f7 2d79 688a 7e18 848d 3c4a e5a7 928a
| SHA-1:   587d 40bb 52b3 4e25 fcf1 4237 8eda 45ad 7f9e 7e3f
| SHA-256: a213 911c 7e66 33ff b4d4 8daf 6a2e 1ab4 e535 4462 b798 19b4 626d 69b5 871d e591
| -----BEGIN CERTIFICATE-----
| MIIDOTCCAiGgAwIBAgIJAIFW7GaOYtM6MA0GCSqGSIb3DQEBCwUAMFwxGzAZBgNV
| BAMMEnNzby5tYW5hZ2VtZW50Lmh0YjE9MDsGA1UECgw0QWRtaW5pc3RyYXRpb24g
| Q29ubmVjdG9yIFJTQSBTZWxmLVNpZ25lZCBDZXJ0aWZpY2F0ZTAeFw0yNjA2MDIw
| MTIzNTlaFw00NjA1MjgwMTIzNTlaMFwxGzAZBgNVBAMMEnNzby5tYW5hZ2VtZW50
| Lmh0YjE9MDsGA1UECgw0QWRtaW5pc3RyYXRpb24gQ29ubmVjdG9yIFJTQSBTZWxm
| LVNpZ25lZCBDZXJ0aWZpY2F0ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
| ggEBAKbUhh7nmQ/EAOdaHrUxKFnfyiNmPP7amMAHikYiJ2A3GtZ+PsSX+adZyOBP
| GvSpa/i9jiUdkLQ2VMCGH/RTu7QFBLYXqj8g2RmRWuyPYVeizWcOOURrCAVr0BZu
| hBqrlrU1kN4Rsmhx6vIBSEL0fM6bW/yFt8L0oc2jRDQPV7ufwger9TesK0KyhCz4
| WcR1LBCSe+DLFtPvYh+I4vAUp/CBaB4JUyzlhQscpVC/Pm2Yz0ZNLx4QXn9Mifg9
| 2Cre/pj0h+Uj8/H/ebAyusrz7E1ss2HLrYTdDpo3J4BNYNA5g2J+t/S7E7jLwQDX
| vOcp9hDP0CwN8l2RSw3EH69LD/MCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAZAaF
| Pw7cSMv1V2oedWG100naJt7hrd9TMzqGCV/KDl8vaG2ZCR//yhqsNKVHfxc8sSMH
| zMAEUA8T3wMheHQcwAnCKPHPkQmlvGtpZgsqPuMYNx4wwdDhLh8kcwtbDY4sJbwL
| mNrY7x6wovcrMcs74x4AhoxLkVJ8AQBNW3FcDp4GCtmORWhIfpzKhcrtc9zgEAdw
| dilIWPT688ZNQ3T+uPnw0VybpZTvO/PRKE2qidFZ/TTjsI7SK6CEWl09ayQKJcVW
| UAs4R66Vd/nLg+FxL18vpivyvDJIs0u8GEy3YuTKlK+mT+GVOY6F306n2EDrAbHL
| UOOjtnxeafnwwOSBnw==
|_-----END CERTIFICATE-----
|_ssl-date: TLS randomness does not represent time
| fingerprint-strings:
|   LDAPSearchReq:
|     0<0:
|     objectClass1+
|     ds-root-dse
|_    ds-cfg-root-dse-backend0
32903/tcp open  java-rmi    syn-ack Java RMI
50389/tcp open  ldap        syn-ack (Anonymous bind OK)
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port4444-TCP:V=7.98%T=SSL%I=7%D=10/3%Time=6AC1175C%P=x86_64-pc-linux-gn
SF:u%r(LDAPSearchReq,55,"0E\x02\x01\x07d@\x04\x000<0:\x04\x0bobjectClass1\
SF:+\x04\x03top\x04\x0bds-root-dse\x04\x17ds-cfg-root-dse-backend0\x0c\x02
SF:\x01\x07e\x07\n\x01\0\x04\0\x04\0");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

PORT 1689(Java RMI)

# FOOTHOLD

# PRIV ESCLATION