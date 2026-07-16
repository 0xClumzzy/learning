use std::io;
use std::cmp::Ordering;
use rand::Rng;

fn main() {
	println!("GUESS");
	//secret
	let secret = rand::thread_rng().gen_range(1..=100);

	loop{
		println!("input yo guess: ");

		let mut guess = String::new()

		//collect
		io::stdin().read_line().expect("failed to read line");

		//process
		let mut: u32 = match guess.trim().parse() {
			Ok(num) => num,
			Err(_) => continue,
		};

		println!("you guessed: {guess}");
		//compare

		match guess.cmp(&secret){
			Ordering::Less => println!("too small"),
			Ordering::Greater => println!("too big"),
			//end the game
			Ordering::Equal => {
				println!("You win");
				break;
			}
		}
	}
}
