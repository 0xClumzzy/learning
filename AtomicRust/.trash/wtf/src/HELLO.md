Hello world

The basic hello world 

```rust
fn main() {
    println!("hello, world);
}
```

v2

```rust
pub fn hello() -> &`static str {
    "hello, world! "
}

// &'static is a "lifetime specifier", something you'll learn more about later
```

Breakdown:

- `pun fn hello()`, pub makes it public fn defines a function "hello" with no args 

- `-> &'static` str returns a string slice reference that's guaranteed to live for the entire program's duration. 

The reverse string , from input 

```rust
pub fn reverse(input: &str) -> String {
    input.chars().rev().collect()
}
```
