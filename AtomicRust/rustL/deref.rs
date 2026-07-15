fn main(){
	let mut name = String::from("0x");
	let alias = &mut name;
	*alias += "ClumzZy";
	println!("You alias is {name}", name);
}
