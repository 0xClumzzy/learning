#include <stdio.h>

void bday(int* age);
int main(){
    int age = 25; 
    
    bday(&age);
    printf("you are %d years old", age);
    return 0;

}

//bday time 

void bday(int* age){
    (*age)++;
}
