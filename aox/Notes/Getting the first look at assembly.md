[[Hello World]]

The complied binary of that hello file will be Objdumped.....
```bash
objdump -M intel -D hello | grep -A20 main.:
```

this basically is gettting machine code for the first 20 lines of the main function of the hello world code
```
0000000000001149 <main>:
    1149:	55                   	push   rbp
    114a:	48 89 e5             	mov    rbp,rsp
    114d:	48 83 ec 30          	sub    rsp,0x30
    1151:	64 48 8b 04 25 28 00 	mov    rax,QWORD PTR fs:0x28
    1158:	00 00 
    115a:	48 89 45 f8          	mov    QWORD PTR [rbp-0x8],rax
    115e:	31 c0                	xor    eax,eax
    1160:	48 b8 48 65 6c 6c 6f 	movabs rax,0x57202c6f6c6c6548
    1167:	2c 20 57 

```
an so on.....

What you are seeing is instructions(`pus,sub,mov`) and registers(`rbp,rax,eax,rsp`)
