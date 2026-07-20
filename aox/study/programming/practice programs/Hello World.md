Printing hello world 10 times
```c
#include <stdio.h>
#include <string.h>

int main(){
	char greeting[20] = "Hello, World\0";
	
	for(i=0, i<10, i ++){
		printf("%s", greeting)
	};
	
	return 0;
}
```
The first line may be confusing, but it's just C syntax that tells the compiler to include headers for a standard input/output (I/O) library named stdio. This header file is added to the program when it is compiled. It is located at /usr/include/stdio.h, and it defines several constants and function prototypes for corresponding functions in the standard I/O library. Since the main() function uses the printf() function from the standard I/O library, a function prototype is needed for printf() before it can be used. This function prototype (along with many others) is included in the stdio.h header file