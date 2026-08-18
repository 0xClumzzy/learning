
THE SCARY MFS
A pointer is a variable that stores the memory address of another variable 
```
int x = 5; // x stores the value of 5
int *p; //p stores the address of some int
```
more
```
x //variable
&x = address of x 
```

so `*` is a called a derefence. It means to got o that address  and get/set the value 
and `&` is called the address-of operator. It means get me the address

Before we go on. WHat are the benefits of pointers
- Memory saving. Instead of copying a large data structure, you can just use its pointer(address)
- bro code gave a good analogy
	- Pizza party. Instead of going to your friend's houses and givin them a box of pizza each, you give them your address so they come get pizza
You are passing the address of something
To get  an address 
```
int age = 30;
printf("%p", &age);
```
the `p` format specifier is for pointer, the you stick in the address of variable age
so:
```
int age = 30; 
int *pAge = &age;

printf("%p", &age);
printf("%p", pAge);
```
Should give you the same value
The first statement prints the address of age, the second prints the vallue of the pointer. `*pAge` stores the address of age(some int)

Pointers and functions 
```C
#include <stdio.h>
 
 void birthday(int *age);
 int main(){}
```
so the goal is to use a pointer to increment the age 
```c
#include <stdio.h>
 
 void birthday(int *age);
 int main(){
	 int age = 25;
	 int *pAge = &age;
	 
	 print("You are %d years old", age);
 }
```

