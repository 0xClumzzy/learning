
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

**Return value

```c
unsigned int sleep(unsigned int seconds);
```

- `0` → Slept for the full time.
- Non-zero → Interrupted by a signal before the time expired. The return value is the number of seconds left.

Example:

```c
unsigned int remaining = sleep(10);

printf("%u seconds were left\n", remaining);
```

On Windows, the equivalent is:
```c
#include <windows.h> 
Sleep(3000);   // milliseconds, not seconds
```
 Notice the capital `S` and that the argument is in **milliseconds**.
### Summary

| Function                | Unit         | Header                  |
| ----------------------- | ------------ | ----------------------- |
| `sleep(3)`              | seconds      | `<unistd.h>`            |
| `usleep(500000)`        | microseconds | `<unistd.h>` (obsolete) |
| `nanosleep()`           | nanoseconds  | `<time.h>`              |
| `Sleep(3000)` (Windows) | milliseconds | `<windows.h>`           |