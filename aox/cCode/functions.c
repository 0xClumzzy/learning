#include <stdio.h>
#include <strings.h>


void song(char name[], int age){
    printf("happy birthday to you");
    printf("happy birthday to you");
    printf("happy birthday to %s\n", name);
    printf("how old are you now: %d ", age);
    printf("how old are you now: %d ", age);
}
int main(){
    char name[50] = "";
    int age = 0;

    printf("what is yo name? \nENTER HERE=> ");
    fgets(name, sizeof(name), stdin );
    name[strlen(name) - 1] = '\0';

    pr
    return 0;
}
