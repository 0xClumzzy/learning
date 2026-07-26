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
    scanf("%.lf\n", &principal );

    printf("Enter the interest rate:\nENTER HERE=> ");
    scanf("%lf\n", &rate);
    rate = rate/100

    printf("Enter the time(t):\nENTER HERE=> ");
    scanf("%lf\n", &time);

    printf("Enter the #no of times compunded per year\nENTER HERE=> ");
    scanf("%lf\n", &timesCompounded );

    totalAmount = principal * pow(1+rate/timesCompounded,timesCompounded*time);
    printf("After %.1f\nyears  Your compund is interest is:\n=> P%.2lf",time,totalAmount);
    //calculate




    return 0;
}
