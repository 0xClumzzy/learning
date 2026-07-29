Break = Stop
	Break out of the loop 
Continue = SKIP 
	Skip the current cycle of the loop 

**break**
```c
int main(){
	for(int i=0; i <= 10; i++){
		if(i == 3){
			break;
		}
		printf("%d\n",i);
	}
	return  0;
}
```