int main (){
	int scores[5] = {0};

	for(int values=0;values <=5;values++){
		if(scanf("%d", scores[values]) != 1){
			printf("Enter a value");
			while(getchar() != '\n');
			continue;
		}
	}
	for(int i; i <=5;i++){
		printf("%d", scores[i]);

	}
	return 0;
}
