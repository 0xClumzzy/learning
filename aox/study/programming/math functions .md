The `<math.h>` from the math library is needed 

SQUARE ROOT FUNCTION
```c
int main(){
	int x = 9;
	
	x = sqrt(x);
	
	printf("%d", x);
}
```
`sqrt()` returns a `double`, but you're stuffing it into an `int`. `sqrt(9)` gives you `3.0`, which gets truncated to `3` when assigned to `x`
warning like:
> warning: implicit conversion from 'double' to 'int' changes value

Worth compiling with `-Wall` so you actually see that

**Linking the math library**  
On some systems (mainly Linux with gcc), `math.h` functions need to be explicitly linked or you get an undefined reference error at link time:
```c
gcc yourfile.c -o output -lm
```

EXPONENT/POWER FUNCTION
```c
int main(){
	int x = 3;
	
	x = pow(x,2)
}
```
so its `pow(value, value.of.power);`

ROUNDING FUNCTIONS 
- `round()`- normal rounding 
```c
int main(){
	float x = 3.5;
	
	x = round(x)
	
	printf("%.1f", x);
	
	return 0;
}
```
- `ceil()`- ceiling function. Rounds up
```c
#include <stdio.h>
#include <math.h>

int main(){
    float x = 3.5;

    x = ceil(x);

    printf("%.1f",x);

    return 0;

}
```
- `floor()` rounds down 
```c
#include <stdio.h>
#include <math.h>

int main(){
    float x = 3.5;

    x = floor(x);

    printf("%.1f",x);

    return 0;

}
```
- `abs()`- The absolute function gets the the absolute value, aka the distance from zero 
```c
#include <stdio.h>
#include <math.h>

int main(){
    int x = -3;

    x = abs(x);

    printf("%d",x);

    return 0;

}
```
- `log()`- Logarithm func, gets you the natural logarithm of a func
```c
#include <stdio.h>
#include <math.h>

int main(){
    float x = 3.5;

    x = floor(x);

    printf("%.1f",x);

    return 0;

}
```
- trigonometry functions are also available
	- `sin()`
	- `cos()`
	- `tan()`
	