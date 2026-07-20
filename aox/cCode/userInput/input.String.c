#include <stdio.h>
#include <string.h>

int main() {
    char name[50] = "";

    printf("What is your name?\n ENTER HERE=> ");
    fgets(name, sizeof(name), stdin);
    name[strlen(name) - 1] = '\0';  // strips trailing newline

    printf("Hello, %s!\n", name);

    return 0;
}
