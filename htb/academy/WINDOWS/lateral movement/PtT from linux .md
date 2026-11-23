> **Note:** A Linux machine not connected to Active Directory could use Kerberos tickets in scripts or to authenticate to the network. It is not a requirement to be joined to the domain to use Kerberos tickets from a Linux machine.

>  Linux machines store Kerberos tickets as [ccache files](https://web.mit.edu/kerberos/krb5-1.12/doc/basic/ccache_def.html) in the `/tmp` directory.
- By default, the location of the Kerberos ticket is stored in the environment variable `KRB5CCNAME` 
- This variable can identify if Kerberos tickets are being used or if the default location for storing Kerberos tickets is changed
- These [ccache files](https://web.mit.edu/kerberos/krb5-1.12/doc/basic/ccache_def.html) are protected by specific read/write permissions, but a user with elevated privileges or root privileges could easily gain access to these tickets.

***KERBEROS vs KEYTAB files***
A `keytab` is a file containing pairs of Kerberos principals and encrypted keys (which are derived from the Kerberos password).
- . You can use a keytab file to authenticate to various remote systems using Kerberos without entering a password. BUt if u change yo pass, you have to regenerate your keytab files 
> **Note:** Any computer that has a Kerberos client installed can create keytab files. Keytab files can be created on one computer and copied for use on other computers because they are not restricted to the systems on which they were initially created.

