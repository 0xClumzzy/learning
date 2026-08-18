Enums are user defined data types that consists of a set of named interger constants 
Its a way to give names to numbers
```
enum Colors{
	RED,0
	BLUE,1
	GREEN,2
};
```
Instead of 0,1,2 the color names could work
The order of the enums defualts as numbering
so 
```
enum Day{
Monday, Tuesday..........
};
```
defaulsts to Monday as 0 and so on . Numbering is optional yet significant 
```
enum Day today = Tuesday;
```
printing the value of today prints the numbering of Tuesday, 1

eg2, status codes
```
enum STATUS{
	OK, 200
	FORBIDDEN, 404
	REDIRECT, 302 
};
```

