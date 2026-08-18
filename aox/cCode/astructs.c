#include <stdio.h>

typedef struct{
    int age = 0; 
    char name[50]; 
    float gpa = 0.0f;
}Student;

int main(){
    Student class[3];
    class[0].age = 21;
    class[1].age = 25;
    class[2].age = 36;

    for(int i=0;i<3;i++){
        printf("%s\n", class[i].age);
    }
    return 0;
}
