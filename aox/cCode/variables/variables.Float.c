#include <stdio.h>

int main() {
    float price = 35.95;
    float weight = 25.8;
    float gpa =  3.8;
    float total = (price * weight) / gpa;
    printf("You have to pay the entry fee\n Total: %.2f\n", total);

    return 0;
}
