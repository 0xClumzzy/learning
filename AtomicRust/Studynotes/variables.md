Variable declaration
`let x = 245;`
So variables are  immutable by default 
`let mut x = 245;`
`mut` keyword makes them mutable 

Declaring constants
`cont PI= 3.141592`

Shadowing
```rust 
fn main(){
	let x = 5;
	let x = x+1;
	
	{
		let x = x * 2;
		println!("Inner x is: {x}");
	}
	println!("Outer x is: {x}");
}
```
