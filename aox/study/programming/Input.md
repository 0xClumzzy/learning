Getting user input
```c
int main(){
	int age; 
	float gpa;
	char grade;
	char name[30]; 
	
	return 0;
}
```
undeclared variables lead to undefined behaviour
so instead 
```c
int main(){
	int age = 0; 
	float gpa = 0.0f;
	char grade = '\0';
	char name[30] = ""; 
	
	return 0;
}
```
The **null terminator** (also known as the **null character** or **NUL**) is a special control character with a value of **zero** used to mark the end of a string in memory.  In **C** and **C++**, it is represented by the escape sequence **`\0`** and is automatically appended by the compiler to string literals, allowing functions to determine string length by scanning for this sentinel value.

**`scanf`** is a C standard library function defined in `<stdio.h>` that reads formatted data from the standard input stream (typically the keyboard) and stores it into variables via pointers.  It parses input based on a **format string** containing conversion specifiers (e.g., `%d` for integers, `%s` for strings) and returns the number of successfully assigned items.

INT
```c
int main(){
	int age = 0;
	
	printf("enter your age: );
	scanf("%d\n", &age);
	return 0;
}
```
The **address-of operator** is denoted by the **ampersand symbol (&)** in C and C++.  It is a **unary operator** that returns the **memory address** of its operand, effectively providing a pointer to that variable.

`&age` is basically sayin at the address of age store whatever is sent from stdin 

FLOAT
```c
int main(){
	float gpa = 0.0f;
	
	printf("what is yo GPA?\n ENTER HERE=> ")
	scanf("%.2f", &gpa);
	
	return 0; 
}
```

CHAR 
```c
int main(){
	char grade = '\0';
	
	printf("enter yo grade\n ENTER HERE=> ");
	scanf(" %c", &grade);
	return 0;
}
```
that white space clears the `\n` within the buffer, always add itt 

STRINGS
`<strings.h>` header file has funtionality with strings
```c
int main(){
	char name[50] = '';
	
	getchar();
	printf("What is you name\n ENTER HERE=> ");
	fgets(name, sizeof(name), stdin);
	name[strlen(name) - 1 ] = '\0';
	
	return 0;
}
```
So `fgets`(file gets string) supports whitespaces unlike `scanf`

The **`fgets()`** function is a standard C library routine (declared in `<stdio.h>`) used to **safely read a line of text** from an input stream, such as standard input (`stdin`) or a file pointer.  It prevents buffer overflows by accepting a maximum size parameter, ensuring it reads **up to `n-1` characters** and automatically **null-terminates** the resulting string

`fgets` takes pressing the enter key for submission as new line char, to remove that newline get the length of that string and subtract the last character and set it to a null terminator 
```c
name[strlen(name) -1] = '\0'
```
`getchar()` will eliminate the `\n` within the buffer

final code:
```c
#include <stdio.h>
#include <string.h>

int main() {
    char name[50] = "";

    printf("What is your name?\n ENTER HERE=> ");
    fgets(name, sizeof(name), stdin);
    name[strlen(name) - 1] = '\0';  // strips trailing newline

    printf("Hello, %s!\n", name);

    return 0;
}
```
you only do the first part if there is other input prompts before