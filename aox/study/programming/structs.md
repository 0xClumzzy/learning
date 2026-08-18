 custom containert that holds multiple pieces of reltaed information
 basically custom data types
 <u>Basic struct</u>
```
struct Student{
	char name[50] = '\0';
	int age = 0;
	float gpa = 0.0f;
};
```

<u>With typedef</u>
```
typdef struct{
	char name[50] = '\0';
	int age = 0; 
	float gpa = 0.0f;
}Student;

int main(){
	Student s1;
	s1.name = "potato"
	s1.age = 25;
	s1.gpa = 3.5 
	return 0;
}
```

<u>Array of structs</u>
```
Student class[3];
class[0].age = 20;
class[1].age = 21;

for(int i=0; i<3;i++){
	printf("%s\n", class[i].name)
}
```
eg2:
```
#include <stdio.h>

typedef struct{
	char name[50];
	int year;
	float price;
}Car;

int main(){
	Car car1 = {"Audi", 2005, 60000};
	Car car2 = {"BIMA", 2022, 70000};
	Car car3 = {"BENZ", 2024, 1000000};
	return 0;
}
```

If you dont wanna assign values to a struct right away. This how you can do it
```
Student student4 = {0};
strcpy(student4.name, "Boobies");
student4.age = 24;

```