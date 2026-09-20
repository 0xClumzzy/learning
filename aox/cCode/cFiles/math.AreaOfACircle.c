#include <stdio.h>
#include <math.h>

int main(){
    const double pi = 3.14215926;
    double radius = 0.0;
    double area = 0.0;

    printf("Enter your radius..\nENTER HERE=> ");
    scanf("%lf", &radius);

    area = pi * pow(radius,2);
    printf("%.lf", area);
    return 0;
}
