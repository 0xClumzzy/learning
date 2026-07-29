theyrelike resuable blocks of code

```
<return type> <func name>(arg1, arg2){some code}
```

**Return types**

A **return type** tells the compiler what kind of value a function gives back to whoever called it.
general syntax:

```
return_type function_name(parameters) {
    return value;
}
```
Common return types:

| Return Type                   | Meaning                                          | Example           |
| ----------------------------- | ------------------------------------------------ | ----------------- |
| `void`                        | Returns nothing                                  | `void print()`    |
| `int`                         | Returns an integer                               | `int sum()`       |
| `char`                        | Returns one character                            | `char getGrade()` |
| `float`                       | Returns a floating-point number                  | `float average()` |
| `double`                      | Returns a higher-precision floating-point number | `double pi()`     |
| `bool` *(C99, `<stdbool.h>`)* | Returns `true` or `false`                        | `bool exists()`   |
