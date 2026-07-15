# Microsoft SQL

- Closed source version DBMS by Windows

- For applications that run on microsoft's .NET framework

- port 1433 

### MSSQL clients

- SSMS is the comes pre installed 

- Other clients: mssql-cli, impacket's mssqlclient.py, SQL Server Powershell

### MSSQL database

| Default System Database | Description                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `master`                | Tracks all system information for an SQL server instance                                                                                                                                               |
| `model`                 | Template database that acts as a structure for every new database created. Any setting changed in the model database will be reflected in any new database created after changes to the model database |
| `msdb`                  | The SQL Server Agent uses this database to schedule jobs & alerts                                                                                                                                      |
| `tempdb`                | Stores temporary objects                                                                                                                                                                               |
| `resource`              | Read-only database containing system objects included with SQL server                                                                                                                                  |

Default config:

When an admin initially installs and configures MSSQL to be network accessible, the SQL service will likely run as `NT SERVICE\MSSQLSERVER`. Connecting from the client-side is possible through Windows Authentication, and by default, encryption is not enforced when attempting to connect.

Dangerous commands

- MSSQL clients not using encryption to connect to the MSSQL server
- The use of self-signed certificates when encryption is being used. It is possible to spoof self-signed certificates
- The use of [named pipes](https://docs.microsoft.com/en-us/sql/tools/configuration-manager/named-pipes-properties?view=sql-server-ver15)
- Weak & default `sa` credentials. Admins may forget to disable this account

footprnting the service 

```bash
sudo nmap -sV -p 1433 10.129.201.248 \
 --script ms-sql-info,ms-sql-empty-password,ms-sql-xp-cmdshell,ms-sql-config,ms-sql-ntlm-info,ms-sql-tables,ms-sql-hasdbaccess,ms-sql-dac,ms-sql-dump-hashes --script-args mssql.instance-port=1433,mssql.username=sa,mssql.password=,mssql.instance-name=MSSQLSERVER 
```

in metasploit 

> msf6 auxiliary(scanner/mssql/mssql_ping) 

```bash
set rhosts 10.10.10.10
run 
```

connect to MSSQL using  myssqlclient.py 

```bash
python3 mssqlclient.py Administrator@10.10.10.10 -windows-auth
```

> SQL> select name from sys.databases
87N1ns@slls83