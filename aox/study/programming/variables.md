[[_OceanofPDF.com_Hacking_The_Art_of_Exploitation_2nd_Edition_-_Jon_Erickson.pdf]]

A `variable` is a placeholder for data where variable data can be changed
A `constant` is a type of variable where data does not change

Variable declarations allow you to make preparations before getting into the meat of the program. Declarations allow the compiler to organize this memory more efficiently

Each variable is given a type that describes the information that is meant to be stored in that variable. Some of the most common types are `int` (integer values), `float` (decimal floating-point values), and `char` (single character values). Variables are declared simply by using these keywords before listing the variables

INT
```C
int main(){
	int age = 26;
	int year = 2031; 
	int quantity = 21;
	
	printf("You will be %d in %d since you are %d in 2026", age,year,quantity);
	return 0;
}
```
so the syntax of writing a variable is 
```
<type declaration> <variable.name> = <value>;
```
format specifiers in print statements 
```
printf("string specifier for value: %d at variable.name",variable.name);
```
`%d` meaning decimal 
we use format specifiers to display variable data

FLOAT
```c
int main(){
	float price = 35.00; 
	float weight = 25.8;
	float gpa = 2.5;
	
	printf("Since you gpa is %f\n and you also weigh %f\n I will charge you %f", gpa, weight, price);
	return 0;
}
```
storing decimals
`%f` is the format specifier 
you can tune the precision by `.1f`. Its like specifying the number of decimal places 

DOUBLE
```c
int main(){
	double pi = 3.141592;
	printf("the value of pi is %6lf",  pi);
	
	return 0;	
}
```
storing very long/recurring decimals
`%lf` basically means long float

CHAR
```c
int main() {
	char grade = 'F';
	char goal = 'A'
	
	printf("your grade is %c:\n but your goal is %c:\n", grade, goal);
	return 0;
}
```
basically char stores a single character

STRING 
```c
int main(){
	char name[] = "the monkey guy";
	printf("his name is literally %s\n", name);
	
	return 0;
}
	
```
a string is basically an array of chars in C 
`%s` is used to display strings

BOOL
```c
int main(){
	bool isOnline = true;
	
	if(isOnline){
		printf("you are ONLINE");
	}
	else{
		printf("you are offline");
	}
	
	return 0; 
}
```
so bolean requires `<stdbool.h>`

FORMAT SPECIFIERS

format specifiers can be used to control the `width`, `precision` and flags

WIDTH 
Width specifies the minimum number of characters to print 
```c
int main(){
	int num1 = 1;
	int num2 = 10; 
	int num3 = 100;
	
	printf("%d\n", num1);
	printf("%d\n", num2);
	printf("%d\n", num3);
	return 0;
}
```
it prints whitespaces too 
`%3d` - will print 3 chars
`%-3d` - left justifies
`%03d` - adds leading 0s


PRECISION 
Precision specifies the number of decimal places to be displayed 
```c
int main(){
	float price1 = 19.99;
	float price2 = 29.99;
	float price3 = 39.99;
	
	printf(".2f%", price1);
	printf(".2f%", price3);
	printf(".2f%", price2);
	
	return 0;
}
```
`.2f` - its like display 2 decimal places, anything more that that will be rounded 

