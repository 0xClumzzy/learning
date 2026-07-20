
[[Input]]
[[variables]]

Formula:
# $A=\pi r^2$

code 
```c
#include <stdio.h>
#include <math.h>

int main(){
	const double pi = 3.145926;
	double radius = 0.0;
    double area = 0.0;
    
    printf("Enter the radius..\nENTER HERE=> );
    scanf("%lf", &radius);

    area = pi * pow(radius, 2);
	printf("Area is: %.4lf", area);

    return 0;

}

```

