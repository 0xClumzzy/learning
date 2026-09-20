//READING FILES,again 

int main(){
	FILE *pFILE= fopen("~/token", "r");
	char buffer[1024] = {0};

	//errors
	if(pFILE == NULL){
	    printf("could not read file");
	    return 0;
	}
	//read
	while(fgets(buffer, sizeof(buffer), pFILE) != NULL){
	    printf("%s", buffer );
	}
	//close 
	fclose(pFILE);
}
