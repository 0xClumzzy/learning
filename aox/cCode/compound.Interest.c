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
    scanf("%.2lf\n", &principal );
    
    printf("Enter the interest rate:\nENTER HERE=> ");
    scanf("%.2f\n", &rate);
    rate = rate/100 
            
    printf("Enter the years(t):\nENTER HERE=> ");
    scanf("%.1f\n", &years);
    
    printf("Enter the #no of times compunded per year:\nENTER HERE=> ");
    scanf("%.2lf\n", &timesCompounded );
    
    totalAmount = principal * pow(1+rate/timesCompounded,timesCompounded*years);
    printf("Your %lf")
    //calculate 
    


    
    return 0;
}