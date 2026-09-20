#include <stdio.h>

int main(){
    int num = 0;
    scanf("%d",&num);
    printf("Num: %d is %s", num, (num%2 == 0) ? "even": "odd");
    return 0;
}
