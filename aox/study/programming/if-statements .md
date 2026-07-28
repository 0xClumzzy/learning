Philosophy:
	*Do some code if condition is true* 
```
if (condition){dothis}
else if{dothis}
else{dothat}
```
order of comparison matters.. 

If u had to compare ages the order of clauses will affect the comparison 

if statements with strings 
```c
#include <stdio.h>
#include <string.h>

int main(){
	char name[50]= "";
	
	printf("what is yo name?");
	fgets(name, sizeof(name), stdin);
	name[strlen(name) -1 ] = '\0'
	
	if(strlen(name) == 0){printf("You did not enter yo name!");}
	else{printf("hello %s\n",name);}
}
```

NESTED IF STATEMENTS 
