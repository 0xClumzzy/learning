# MySQL

- Open source Database management system

- Controlled using sql

- Adheres to the client server principle 

- tcp 3306

### MySQL clients

- Retrieve or edit data through queries

- Inserting,modifying , deleting and retrieving

- Simultaneous query management

- Use case: CMS Wordpress

### MySQL database

-  Use where efficient syntax and speed are essential

- Combination => Linux Apache MysQL PHP or LAMP

Default @`/etc/mysql/mysql.conf.d/mysqld.cnf`

DANGEROUS SETTINGS

| **Settings**       | **Description**                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| `user`             | Sets which user the MySQL service will run as.                                                               |
| `password`         | Sets the password for the MySQL user.                                                                        |
| `admin_address`    | The IP address on which to listen for TCP/IP connections on the administrative network interface.            |
| `debug`            | This variable indicates the current debugging settings                                                       |
| `sql_warnings`     | This variable controls whether single-row INSERT statements produce an information string if warnings occur. |
| `secure_file_priv` | This variable is used to limit the effect of data import and export operations.                              |

Footprinting the service 

```bash
sudo nmap --min-rate 5000 -p3306 -sCV --script mysql*
```

Interact with the service 

```bash
mysql -u root -h -p<password> 10.10.10.10
```

> -p and pass no space

| **Command**                                          | **Description**                                                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `mysql -u <user> -p<password> -h <IP address>`       | Connect to the MySQL server. There should **not** be a space between the '-p' flag, and the password. |
| `show databases;`                                    | Show all databases.                                                                                   |
| `use <database>;`                                    | Select one of the existing databases.                                                                 |
| `show tables;`                                       | Show all available tables in the selected database.                                                   |
| `show columns from <table>;`                         | Show all columns in the selected table.                                                               |
| `select * from <table>;`                             | Show everything in the desired table.                                                                 |
| `select * from <table> where <column> = "<string>";` | Search for needed `string` in the desired table.                                                      |

Dump a single db 

```bash
mysqldump -u USER -p DATABASE > database.sql
```

dump the all dbs

```bash
mysqldump -u USER -p --all-databases > all.sql
```

Only the schema?

```bash
mysqldump -u USER -p --no-data DATABASE > schema.sql
```

Only the data?

```bash
mysqldump -u USER -p --no-create-info DATABASE > data.sql
```

OR specify query

```bash
mysql -u USER -pPASS -e "SHOW TABLES;" DATABASE
```

SSL verification?

```bash
mysql -u USER -pPASS -e "SHOW TABLES;"--ssl-verify-server-cert=OFF DATABASE
```


