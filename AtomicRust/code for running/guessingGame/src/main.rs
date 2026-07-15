use std::io;

fn main(){
	println!("Guess.......");
	println!("input your guess: ");

	let mut guess = String::new();

	io::stdin()
		.read_line(&mut guess)
		.expect("failed to readline");
	println!("your guess is: {guess}");
}
