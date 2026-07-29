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
        printf("**WELCOME TO CLUMZZY BANKING SERVICES**\n");
        printf("\nSELECT OPTION\n");
        printf("1.Withdraw\n");
        printf("2.Deposit\n");
        printf("3.Check balance\n");
        printf("4.exit\n");
        //rotate
        scanf("%d\n", &choice);
        switch(choice){
            case 1:
                balance -= withdraw(balance);
                break;
            case 2:
                balance +=deposit();
                break;
            case 3:
                checkBalance(balance);
                break;
            case 4:
                break;
        }
    }while(choice !=4)
    
    
    return 0;
}

void checkBalance(){}
float withdraw(){}
float deposit(){}