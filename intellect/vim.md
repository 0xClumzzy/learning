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
	`d` will delete the whole line 
	`dw` will delete a specific word until the start of the next word
	`de` is until the end
	
	if you wanna delete a whole as line, go to the start of the line, `d$` deletes the whole line 
	
	`2w` will move two words forward, you can increase the count 3 moves 3 words....
	`2e` moves the cursor to the end of the third word 
	`0` moves to the start of the line
	`$` jumps to the end
	`^` jumps to the first non whitespace character on the line  