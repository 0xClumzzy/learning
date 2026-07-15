---

mindmap-plugin: markdown

---
Create new project folder
run:
```
cargo new guessingGame
```
that creates the folder:
[[Cargo.toml]]
[[manifest]]
[[helloword]]
[[main.rs]]
[[notes]]
```
❯ tree guessingGame
[4.0K]  guessingGame/
├── [4.0K]  src/
│   └── [  45]  main.rs
└── [  83]  Cargo.toml

2 directories, 2 files
```

Game logic 
```mermaid
	flowchart LR 
	user--input-->processing--checking-->result
```
Recieving user input 
- To obtain user input and then print the result as output, we need to bring the `io` input/output library into scope. The `io` library comes from the standard library, known as `std`:
```rust
use std::io;
```
 Rust has a set of items defined in the standard library that it brings into the scope of every program. This set is called the _prelude_

If a type you want to use isn’t in the prelude, you have to bring that type into scope explicitly with a `use` statement. Using the `std::io` library provides you with a number of useful features, including the ability to accept user input.

Storing values with variables
```rust 
let  mut guess = String::new();
```
In Rust, variables are immutable by default, meaning once we give the variable a value, the value won’t change. To make a variable mutable, we add `mut` before the variable name

`String::new`, a function that returns a new instance of a `String`. [`String`](https://doc.rust-lang.org/std/string/struct.String.html) is a string type provided by the standard library that is a growable, UTF-8 encoded bit of text.

The `::` syntax in the `::new` line indicates that `new` is an associated function of the `String` type. An _associated function_ is a function that’s implemented on a type, in this case `String`. This `new` function creates a new, empty string.

In full, the `let mut guess = String::new();` line has created a mutable variable that is currently bound to a new, empty instance of a `String`

call the `stdin` function from the `io` module, which will allow us to handle user input:
```rust
io::stdin()
	.read_line(&mut guess);
```

- the line `.read_line(&mut guess)` calls the [`read_line`](https://doc.rust-lang.org/std/io/struct.Stdin.html#method.read_line) method on the standard input handle to get input from the user.
	-  `&mut guess` as the argument to `read_line` to tell it what string to store the user input in.
- The full job of `read_line` is to take whatever the user types into standard input and append that into a string (without overwriting its contents), so we therefore pass that string as an argument.
- The `&` indicates that this argument is a _reference_, which gives you a way to let multiple parts of your code access one piece of data without needing to copy that data into memory multiple times.
Handle the errors, during input collection 
```rust
.expect("failed");
```
The whole thing can be written as such;
(relatively)
```rust 
io::stdin().read_line(&mut guess).expect("failed);
```
(absolutely)
```rust
std::io::stdin().read_line(&mut guess).expect("failed);
```

one long line is difficult to read, so it’s best to divide it. It’s often wise to introduce a newline and other whitespace to help break up long lines when you call a method with the `.method_name()` syntax.

