#include <stdio.h>

int main(){
    int day = 0;
    switch(day){
        case 1:
            printf("It is monday");
            break;
        case 2:
            printf("It is Tuesday");
            break;
        case 3:
            printf("It is Wednesday");
            break;
        case 4:
            printf("It is Thursday");
            break;
        case 5:
            printf("It is Friday");
            break;
        case 6:
            printf("It is Saturday");
            break;
        case 7:
            printf("It is Sunday");
            break;
        default: printf("Enter a day(1-7)");
            
    }
    

    
    return 0;
}
