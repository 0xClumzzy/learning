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
	`o` will open a line below yo curent line
	`O` does above
	
	So while movin your cursor, whatever letter it is on `x` will remove that letter 
	
	On the other hand, `a` will append. `e` will move through to the end of words, `A` will insert at the end of the line
	`d` will delete the whole line 
	`dw` will delete a specific word until the start of the next word
	`de` is until the end
	
	if you wanna delete a whole as line, go to the start of the line, `d$` deletes the whole line 
	
	`2w` will move two words forward, you can increase the count 3 moves 3 words....
	`2e` moves the cursor to the end of the third word 
	`0` moves to the start of the line
	`$` jumps to the end
	`^` jumps to the first non whitespace character on the line 
	
	`u` will undo chnages one by one
	`U` undoes changes made onthe line
	`ctrl+r` redoes the undo, if im making sense
	`p` will put previosly deleted content after the line you are at  
	
	`r` will replace the letter you are at with the letter you type next to it 
	eg,`rx` will replace the the m in move with x if your cursor is at m 
	`ce` will delete the word your at and replaces it with whatever you wnar
	eg, if you have a typo "wrodfw", place your cursor at the d, `ce` erases every letter till the end of thar word and allows you to edit it
	`R` replaces more than one character
	
	`cc` does the same for the whole line  
	`cw` does with words
	`c$` from start to end of your cursor
	
	`ctrl+g` will show you yo file location and status 
	`G` takes you to the end of the file 
	`gg` will take you to the beginning
	`423G` takes you to line num 423
	
	`/` will allow you to search forward for something 
	after searching `n` moves to the next occurance from where you at, `N` does the opposite. `/` jumps to the next occurance
	`?` allows you to search backward, it jumps to the previous occurance of the word
	`ctrl+o` takes me back where i was, htheein it does more of it
	`ctrl+i` goes forward
	ALL BEFORE THE SEARCH 
	
	`%` will jump to the matching `(` or `[` or `{` 
	eg (what the fuck goin on)
	% will move to the closing counterpart of the parenthesis
	basically it jumps between brackets
	
	`:s/thee/the/g` it replaces thee for the, every "thee" occurance will be replaced with "the". The `s` means substitute `g` means globally in the line
	`:12,15s/thee/the/g` will replace every occurance from line 12 to 15
	`%s/thee/the/g` will replace every occurace in the whole file immediately
	`%s/thee/the/gc` will replace every occurance in the whole file with a confirmation prompt
	
	From cursor location `v`  will select to wherever you want, `:w file.txt` will save that to file.txt, `d` deletes the selection 
	`:r file` will paste the contents of file in your current file
	`:r !ls` will paste the output of ls in the file you are working on. works with any command 
	`y` will copy text and `p` will paste it below, `P` does it above. `v` to select
	FOr whever that you copied, `ctrl+j` will paste it at the beginning of the line, `p` pastes it as it was, respective of indentation 
	`yy` copies the entire line 
	