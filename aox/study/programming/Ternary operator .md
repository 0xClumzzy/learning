Ternary operator is like a shorthand if statement 
syntax
`(condition) ? value_if_true:value_if_false;`
so the ? is the if action, condition determines the return value 
<u>USE CASES</u>
1. Value based conditions 
Check if student if discount if true
```c
bool isStudent = true;
float price = isStudent ? 10:20;  
```
if condition is true price discount 
```c
int x = 3;
int y = 5; 
int max = (x>y) ? x:y;
```
if x is greater than y return x otherwise return y 
with strings:
checking if user is online too
```C
int main()
{
	bool isOnline = true;
	printf("Status:  %s\n", isOnline ? "Online": "Offline);
}
```
Shout out bro code for this one
CHeck if a num is even or odd
```C
int main(){
	
	int num = 7;
	printf("Num: %d is %s", num, (num % 2 == 0) ? "even":"odd");
	return 0;
}
```
