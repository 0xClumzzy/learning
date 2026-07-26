#include <stdio.h>
#include <math.h>

int main(){
    //declare
    double totalAmount = 0.0;
    double principal = 0.0;
    float rate = 0.0f;
    float timesCompounded = 0.0f;
    float time = 0.0f;

    //user input
    printf("Enter the principal:\nENTER HERE=> ");
    scanf("%lf", &principal);

    printf("Enter the interest rate:\nENTER HERE=> ");
    scanf("%f", &rate);
    rate = rate / 100;

    printf("Enter the time(t):\nENTER HERE=> ");
    scanf("%f", &time);

    printf("Enter the #no of times compounded per year\nENTER HERE=> ");
    scanf("%f", &timesCompounded);

    //calculate
    totalAmount = principal * pow(1 + rate/timesCompounded, timesCompounded*time);

    printf("After %.1f years, your compound interest total is:\n=> P%.2lf\n", time, totalAmount);

    return 0;
}
