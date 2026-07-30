#include <stdio.h>

int main(void){
    int scores[5] = {0};

    for(int values = 0; values < 5; values++){
        printf("Enter a value for score:\nENTER HERE=> \n");
        if(scanf("%d", &scores[values]) != 1){
            printf("Enter a value\n");
            while(getchar() != '\n');
            values--;  // stay on this index, don't skip it — retry
            continue;
        }
    }

    for(int i = 0; i < 5; i++){
        printf("%d ", scores[i]);
    }
    printf("\n");

    return 0;
}
