#include <stdio.h> 

int main(){
    FILE *pFILE = fopen("/home/clumzzy/scripts/BASH/ash.sh", "r");
    char BUFFER[1024] = {0};

    if(pFILE == NULL){
        printf("Could not open file");
        return 0;
    }
    while(fgets(BUFFER, sizeof(BUFFER), pFILE) != NULL){
        printf("%s\n", BUFFER);
    }
    fclose(pFILE);
}
