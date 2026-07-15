# Internet Message Access Protocol/ Post Office Protocol

-  IMAP allows online management of emails directly on the server and supports folder structures. Thus, it is a network protocol for the online management of emails on a remote server. The protocol is client-server-based and allows synchronization of a local email client with the mailbox on the server, providing a kind of network file system for emails, allowing problem-free synchronization across several independent clients

- POP3 only provides listing, retrieving, and deleting emails as functions at the email server.

- port 143 and 993 imap

- port 110 and 995 for pop3

- packages: `dovecot-imapd` and `dovcot-pop3d`

IMAP Commands

#### IMAP Commands

| **Command**                     | **Description**                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `1 LOGIN username password`     | User's login.                                                                                                 |
| `1 LIST "" *`                   | Lists all directories.                                                                                        |
| `1 CREATE "INBOX"`              | Creates a mailbox with a specified name.                                                                      |
| `1 DELETE "INBOX"`              | Deletes a mailbox.                                                                                            |
| `1 RENAME "ToRead" "Important"` | Renames a mailbox.                                                                                            |
| `1 LSUB "" *`                   | Returns a subset of names from the set of names that the User has declared as being `active` or `subscribed`. |
| `1 SELECT INBOX`                | Selects a mailbox so that messages in the mailbox can be accessed.                                            |
| `1 UNSELECT INBOX`              | Exits the selected mailbox.                                                                                   |
| `1 FETCH <ID> all`              | Retrieves data associated with a message in the mailbox.                                                      |
| `1 CLOSE`                       | Removes all messages with the `Deleted` flag set.                                                             |
| `1 LOGOUT`                      | Closes the connection with the IMAP server.                                                                   |

POP3 commands

| **Command**     | **Description**                                             |
| --------------- | ----------------------------------------------------------- |
| `USER username` | Identifies the user.                                        |
| `PASS password` | Authentication of the user using its password.              |
| `STAT`          | Requests the number of saved emails from the server.        |
| `LIST`          | Requests from the server the number and size of all emails. |
| `RETR id`       | Requests the server to deliver the requested email by ID.   |
| `DELE id`       | Requests the server to delete the requested email by ID.    |
| `CAPA`          | Requests the server to display the server capabilities.     |
| `RSET`          | Requests the server to reset the transmitted information.   |
| `QUIT`          | Closes the connection with the POP3 server.                 |

DANGEROUS SETTINGS 

| **Setting**               | **Description**                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| `auth_debug`              | Enables all authentication debug logging.                                                 |
| `auth_debug_passwords`    | This setting adjusts log verbosity, the submitted passwords, and the scheme gets logged.  |
| `auth_verbose`            | Logs unsuccessful authentication attempts and their reasons.                              |
| `auth_verbose_passwords`  | Passwords used for authentication are logged and can also be truncated.                   |
| `auth_anonymous_username` | This specifies the username to be used when logging in with the ANONYMOUS SASL mechanism. |

Footprinting the service 

- nmap scan with common scripts

- curl 

```bash
curl -k 'imaps://10.10.10.10' --user user:password -v
```

- openssl (tls encrypted interaction with pop3)

```bash
openssl s_client -connect 10.10.10.10:pop3s
```

- openssl (tls encrypted interaction with imap)

```bash
openssl s_client -connect 10.10.10.10:imaps
```

- login 

```bash
a LOGIN user password
```

- list mailbox pattern

```bash
1 LIST "" "*"
```

> - LIST (\Noselect \HasChildren) "." DEV
> - LIST (\Noselect \HasChildren) "." DEV.DEPARTMENT
> - LIST (\HasNoChildren) "." DEV.DEPARTMENT.INT
> - LIST (\HasNoChildren) "." INBOX

This tells us the folder structure and whioch folders i can open 

**The flags:**

- `\Noselect` — this is a container/parent folder only. You *cannot* SELECT it directly, it just organizes child folders (like a directory with no files of its own, only subdirectories).
- `\HasChildren` — this folder has subfolders nested under it.
- `\HasNoChildren` — this is a leaf node, no subfolders, and (implicitly) it's selectable and can hold actual messages

> ##### IMAP Mailbox Structure
> 
> - **DEV**
>   `\Noselect` `\HasChildren` — container only, skip it
>   
>   - **DEV.DEPARTMENT**
>     `\Noselect` `\HasChildren` — also just a container, skip it
>     - **DEV.DEPARTMENT.INT**
>       `\HasNoChildren` —  actual mailbox, SELECT this one
> 
> - **INBOX**
>   `\HasNoChildren` — actual mailbox, SELECT this one

list top level folders 

```bash
1 LIST "" "%"
```

Select the first one `DEV.DEPARTMENT.INT` , dev department internal , syntax `1 SELECT <FOLDER>`

```bash
1 SELECT DEV.DEPARTMENT.INT
```

> * FLAGS (\Answered \Flagged \Deleted \Seen \Draft)
> * OK [PERMANENTFLAGS (\Answered \Flagged \Deleted \Seen \Draft \*)] Flags permitted.
> * 1 EXISTS
> * 0 RECENT
> * OK [UIDVALIDITY 1636414279] UIDs valid
> * OK [UIDNEXT 2] Predicted next UID
>   1 OK [READ-WRITE] Select completed (0.001 + 0.000 secs).

only one mail exists 

check for unseen messages

```bash
s search UNSEEN
```

 Now retrieving only the Subject with `f fetch 1:1 (BODY[HEADER.FIELDS (Subject)])` this 1:1 is because there is only `1 EXISTS` in the inbox if there was `4 EXISTS` the command should look like this `f fetch 1:4 (BODY[HEADER.FIELDS (Subject)])`

```bash
f fetch 1:1 (BODY[HEADER.FIELDS (Subject)])
```

heck the mails we can fetch the data with the email’s number as follows `1 fetch 1 RFC822`

```bash
1 fetch 1 RFC822
```


