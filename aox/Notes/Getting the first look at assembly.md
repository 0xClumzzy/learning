[[Hello World]]

The complied binary of that hello file will be Objdumped.....
```bash
objdump -M intel -D hello | grep -A20 main.:
```

this basically is gettting machine code for the first 20 lines of the main function of the hello world c