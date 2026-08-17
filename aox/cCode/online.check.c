#include <stdio.h>
#include <stdbool.h>

int main(){
    bool isOnline = true;
    char status[] = isOnline ? "Online" : "Offline";
    printf("Status: %s\n", status);
}
