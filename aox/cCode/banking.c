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

        //handle the choice input and errors
        if(scanf("%d", &choice ) != 1){
            printf("Invalid choice");
            while(getchar() != '\0');
            choice = 0;
            continue;
        }
        //choice logic now, rotate
        switch(choice){
            case 1:
                balance = withdraw(balance);
                break;
            case 2:
                balance += deposit();
                break;
            case 3:
                printf("Yo current balnce is:\nBalance=> ");
                break;
            case 4:
                printf("Thanks for using our service");
                break;
            default:
                printf("Invalid choice");
        }
    }while(choice !=0);
    return 0;
}

void checkBalance(float balance){
    printf("\nYour current balance is: P%.2f\n", balance);
}
float withdraw(float balance){
    float amount = 0.0f;
    printf("Your current balance is: %.2f\n", balance);
    printf("enter amount to withdraw: \nENTER HERE=> ");
    scanf("%f", &balance);

    if(scanf("%f",&amount) != 1){
        printf("Enter amount to withdraw");
        while(getchar() != '\0');
        return balance;
    }
    if (amount <= 0){
        printf("Enter amount to withdraw");
        return balance;
    }
    else if (amount > balance) {
        printf("Insufficient funds");
        return balance;
    }
    balance -= amount;
    printf("Successfully withdrew: P%.2f", amount);
    return balance;
    
}

}
