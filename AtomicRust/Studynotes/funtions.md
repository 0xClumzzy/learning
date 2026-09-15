The `main` function, which is the entry point of many programs is very important.

The `fn` declares a fnction
```rust
fn main() {
    println!("Hello, world!");

    another_function();
}

fn another_function() {
    println!("Another function.");
}
```
 `parameters` are special variables that are part of a function’s signature. When a function has parameters, you can provide it with concrete values for those parameters.The concrete values are called `arguments`

**Statement vs expressions**
- A statement performs some action but no value is returned 
```rust
let number = 12;
```
	- function definitions are also statements 
	- You cant assign a let statement another variable:
	```rust
	let x = (let y = 5);
	``` -> you cant do this 

- Expressions evaluate to a resultant value
```rust 
fn main(){
	let y = {
		let x = 3;
		x + 1
	};
	println!()
}
```
 --> used a scope block
	- 
