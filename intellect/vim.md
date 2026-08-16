# First and foremost
### How to leave vim 
```
:q!
```
The above command quits without changes to the file 

- [ ] First learn the terminal command
	- [ ] :!
	This pipes whatever command you want to yo terminal 
	so 
	```
	:!ls
	```
	lists files

- [ ] MOVIN THE CURSOR
	Just use the fucking arrows like a normal person
	or use the letters (`h`(left), `l`(right), `j`(down), `k`(up))
	pick yo poison

- [ ] VIM modes
	- [ ] normal mode
	```
	:
	```
	starts a command
	eg=> `:q`
	quits 
	
	Typin in `i` enters insert mode, allows editing file contents
	`shift i` inserts at the beginning of the line
	
	So while movin your cursor, whatever letter it is on `x` will remove that letter 
	
	On the other hand, `a` will append
	
	`dw` will delete a specific word
	