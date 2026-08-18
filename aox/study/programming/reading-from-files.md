almost similar to writing
We will need a buffer, it will store the contents of the file. Buffer size is in bytes eg 1024(1kb)

The steps to read:
1. open- filename or filepath 
2. Buffer allocation 
3. filename error handling
4. read
5. close 
OPEN 
```
FILE *pFILE = fopen("file.txt", "r");
```
BUFFER ALLOCATION
```
char buffer[1024] = {0};
```
HANDLE FILENAME ERROR 
```
if(pFILE == NULL){
	printf("Could not open file");
	return 0;
}
```
READ
```
while(fgets(buffer, sizeof(buffer), pFILE) != NULL){
	printf("%s", buffer);
}
```
CLOSE 
```
fclose(pFILE);
```