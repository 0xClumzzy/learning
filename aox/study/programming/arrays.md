A collection of elements of the same dat type 
- basically a variable that holds more than one element(list)
```c
<returnType> <variableName>[] = {value1, value2.....}
```
eg:
```c
int main(){
	int numbers[] = {1,2,3,4,5};
	printf("%d", numbers[1]);
	
	return 0;
}
```
view elements of an array by indexing 

to view all elments 
```c
#include <stdio.h>
int main(){
    int numbers[] = {1,2,3,4,5};
    int len = sizeof(numbers) / sizeof(numbers[0]);  // 5

    for(int i = 0; i < len; i++){
        printf("%d ", numbers[i]);
    }
    printf("\n");
    return 0;
}
```
basically:
- `sizeof(numbers)` → size of the **entire array** in bytes. For `{1,2,3,4,5}`, that's 5 elements × 4 bytes each = **20 bytes**.
- `sizeof(numbers[0])` → size of **one element** = **4 bytes**.

Quick reference for common types on a typical 64-bit system (sizes technically aren't guaranteed by the C standard and can vary by platform, but these are the near-universal values you'll see on x86-64/ARM64):

| Type                 | `sizeof` result |
| -------------------- | --------------- |
| `char`               | 1 byte          |
| `short`              | 2 bytes         |
| `int`                | 4 bytes         |
| `float`              | 4 bytes         |
| `double`             | 8 bytes         |
| `int*` (any pointer) | 8 bytes         |

Arrays and user input 
```c
#include <stdio.h>

int main(void){
    int scores[5] = {0};

    for(int values = 0; values < 5; values++){
        printf("Enter a value for score:\nENTER HERE=> \n");
        if(scanf("%d", &scores[values]) != 1){
            printf("Enter a value\n");
            while(getchar() != '\n');
            values--;  // stay on this index, don't skip it — retry
            continue;
        }
    }

    for(int i = 0; i < 5; i++){
        printf("%d ", scores[i]);
    }
    printf("\n");

    return 0;
}

```

2D ARRAYS 
An array where elements are arrays
```c
<returnn type> <variable name>[] [can be number of columns] = {{array1},{array2}};
```
eg 
```c
int main (){
	int array[][3]={{1,2,3},
					{4,5,6},
					{7,8,9}}
	
	return 0;
}
```
Indexing an array
```c
printf("%d", array[row][column]);
```
eg 
```c
printf("%d", array[0][0]);
```
Print all elements
```c
for(int i=0;i<=3;i++){//rows
	for(int j=0;j<=3;j++){//columns
		printf("%d", array[][]);
	}
	printf("\n");
}
```