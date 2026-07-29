#include <stdio.h>
#include <unistd.h>
#include <stdbool.h>

void checkBalance(float balance);
float withdraw(float balance);
float deposit();

int main(){
    int choice = 0;
    float balance = 0.0f;

    do{
        printf("\n**WELCOME TO CLUMZZY BANKING SERVICES**\n");
        printf("\nSELECT OPTION\n");
        printf("1.Withdraw\n");
        printf("2.Deposit\n");
        printf("3.Check balance\n");
        printf("4.exit\n");

        if(scanf("%d\n", &choice) !=)
    return 0;
}

void checkBalance(float balance){
    printf("\nYour current balance is: P%.2f\n", balance);
}
float withdraw(float balance){
    printf("Your current balance is: %.2f\n", balance);
    printf("enter amount to withdraw: \nENTER HERE=> ");
    scanf("%f", &balance);

    return 0.0f;
}
float deposit(){
    float amount = 0.0f;
    printf("\nEnter amount to deposit: ");
    scanf("%f", &amount);

    if(amount <=0){
        printf("Enter valid amount");
        return 0.0f;
    }
    else{
        printf("Successfully deposited P%.2f amount", amount);
        return amount;
    }

}
