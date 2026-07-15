[[notes]]
[[Cargo.toml]]

```rust

use std::io;

fn main(){
	//prompt
	println!("Guess!!!!!!!!!");
	println!("enter yo guess: ");
	
	//store the value
	let mut guess = String::new();
	
	//get user input
	io::stdin()
		.read_line(&mut guess);
		.expect("failed to read line");
		
	//print it back 
	println!("you guessed: {guess});
	
}
```

