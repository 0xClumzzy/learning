#include <stdio.h>
#include <stdbool.h>


int main() {
    float price = 10.00f;
    bool isStudent = true;
    bool isSenior = false;

    //student = 10% discount
    //senior = 20% discount
    //student + senior = 30 discount

    if(isStudent){
        if(isSenior){
            printf("You get a 30% discount\n ");
            price *=0.7;
            printf("pay P%.1f", price);
        }
        else{
            printf("You get a 10% discount\n");
            price *=0.9;
            printf("pay P%.1f", price);
        }
    }
    else {printf("full amount: P%.1f");}
   return 0;
}
