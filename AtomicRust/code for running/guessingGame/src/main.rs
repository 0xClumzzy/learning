use std::io;
use rand::Rng;

fn main(){
	println!("Guess.......");
	let secret = rand::thread_rng().gen_range(1..=100);
	println!("Input yo guess: ");

	let mut guess = String::new();

	io::stdin()
		.read_line(&mut guess)
		.expect("failed to readd the line");
	println!("yo dumb ahh guessed: {guess}");
	println!("this the secret: {secret}");



}
