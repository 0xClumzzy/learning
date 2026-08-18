There is a built in struct "FILE" provided by `stdio` library 
There are 3 steps to follow 
1. open
2. error handling 
3. write 
4. close 
We use a pointer to a file which is `FILE *`
eg `FILE *fFILE`
OPEN
```
FILE  *fFILE = fopen("file.txt", "w");
```
ERRORS 
```
if(pFILE == NULL){
	printf("Error opening file");
	return 1;
}
```
WRITE 
```
char text[50] = "Some text";
fprintf(pFILE, "%s", text);
printf("file successfully written\n");
```
`fprintf` is file printf, used to print to files
its args `fprintf(pointer,fspecifier,data);  `
ERRORS 
```
if(pFILE == NULL){
	printf("Error opening file");
	return 1;
}
```
CLOSE 
```
fclose(pFILE);
```
FULL CODE 
```
#include <stdio.h> 
int main(){ 
	//write to file 
	FILE *pFILE = fopen("file.txt", "w"); 
	char text[50] = "WHAT THE FUCK GOIN ON"; 
	
	if(pFILE == NULL){ 
		printf("error opening file"); 
		return 1; 
	} 
	fprintf(pFILE, "%s", text);
	print("file successfully written");
	fclose(pFILE);
	
	return 0;
}
```
