use std::io;
use std::cmp::Ordering;
use rand::Rng;

fn main(){
	println!("GUESSS.....");
	//secret
	let secret = rand::thread_rng().gen_range(1..=100);
	println!("input yo guess: ");

	//guess as input
	let mut guess = String::new();

	io::stdin().read_line(&mut guess).expect("failed to read line");

	//prossess the input
	let guess: u32 = guess.trim().parse().expect("provide input");

	println!("You guessed: {guess}");

	match guess.cmp(&secret){
		Ordering::Less => println!("Too small"),
		Ordering::Greater => println!("Too big"),
		Ordering::Equal => println!("You win"),
	}
}

