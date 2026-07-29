
The `sleep()` function pauses the execution of your program for a specified amount of time.
it needs:
`windows.h` for windows machines
`unistd.h` for linux machines 

Prototype:

```C
#include <unistd.h>

unsigned int sleep(unsigned int seconds);
```

Example:
```C
#include <stdio.h>
#include <unistd.h>

int main() {
    printf("Start\n");

    sleep(3);   // Pause for 3 seconds

    printf("3 seconds later\n");

    return 0;
}
```


