#include <stdio.h>

typedef enum{
    SUCCESS,FAILURE,PENDING
}Status;
void checkStat(Status status);

int main(){
    Status status = SUCCESS;
    checkStat(status);
    return 0;
}

void checkStat(Status status){
    switch(status){
        case SUCCESS:
            printf("connection successfull\n");
            break;
        case FAILURE:
            printf("connection failed\n" );
            break;
        case PENDING:
            printf("still loading");
            break;
        }
}

