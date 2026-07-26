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

# Registers
- [x] GENERAL PURPOSE REGISTERS
They are used for a variety of purposes, but they mainly act as temporary variables for the CPU when it is executing machine instructions.
- Accumulator(`EAX`)
- Counter(`ECX`)
- Data Register(`EDX`)
- Base Register(`EBX`)
- [x] POINTERS AND INDEXES
**pointers** store 32-bit addresses, which essentially point to that location in memory. These registers are fairly important to program execution and memory management
- Base Pointer (`EBP`)
- Stack Pointer (`ESP`)
	
**indexes** point to the source and destination when data needs to be read from or written to.
- Source Index (`ESI`)
- Destination Index (`EDI`)

- [x] INSTRUCTION POINTER 

GDB is a debugger. It lets you step through compiled programs, examine program memory, and view processor registers. It even has the capability to change instructions along the way
```bash 
gdb -q ./hello 
```
from here you can:
1. Set breakpoints. eg, on main()
	A breakpoint is set on the main() function so execution will stop right before our code is executed.
	- Then GDB runs the program, stops at the breakpoint, and is told to display all the processor registers and their current states.
2. 