#include <stdio.h> 

int main(){
    //write to file 
    FILE *pFILE = fopen("file.txt", "w");
    char text[50] = "WHAT THE FUCK GOIN ON";

    if(pFILE == NULL){
        printf("error opening file");
        return 1;
    }
    fprintf(pFILE, "%s", text);
    print("file successfully written");
    fclose(pFILE);
}
