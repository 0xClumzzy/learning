1. Scalar types 
A scalar type represents a single value 
- intergers(int)
Integer types default to `i32`
Signed integer types start with `i`
Unsigned integer types start with `u`

| Length                 | Signed  | Unsigned |
| ---------------------- | ------- | -------- |
| 8-bit                  | `i8`    | `u8`     |
| 16-bit                 | `i16`   | `u16`    |
| 32-bit                 | `i32`   | `u32`    |
| 64-bit                 | `i64`   | `u64`    |
| 128-bit                | `i128`  | `u128`   |
| Architecture-dependent | `isize` | `usize`  |
Signed integers store values in `two's complement`
Signed integers store both +/-
Each signed variant can store numbers from $$-(2^{n-1})->2^{n-1}-1  $$Where n is the number of bits that variant uses.
So, an `i8` can store numbers from −(27) to 27 − 1, which equals −128 to 127.

Unsigned variants can store from $$0-> 2^{n}-1$$
the `isize` and `usize` types depend on the architecture of the computer your program is running on: 64 bits if you’re on a 64-bit architecture and 32 bits if you’re on a 32-bit architecture.
The primary situation in which you’d use `isize` or `usize` iswhen indexing some sort of collection.

You can write integer literals in any of the forms shown in the above table. Note that number literals that can be multiple numeric types allow a type suffix, such as `57u8`, to designate the type. Number literals can also use `_` as a visual separator to make the number easier to read, such as `1_000`, which will have the same value as if you had specified `1000`.

| Number literals  | Example       |
| ---------------- | ------------- |
| Decimal          | `98_222`      |
| Hex              | `0xff`        |
| Octal            | `0o77`        |
| Binary           | `0b1111_0000` |
| Byte (`u8` only) | `b'A'`        |
- Floating point types 
Rust has two primitives, `f32` and `f64`, in bits 
```rust 
fn main(){
	let x = 2.0; //f64
	let y:f32 = 3.0; //f32
}
```
Floating-point numbers are represented according to the IEEE-754 standard.

- Numeric operators
```rust
fn main() {
    // addition
    let sum = 5 + 10;

    // subtraction
    let difference = 95.5 - 4.3;

    // multiplication
    let product = 4 * 30;

    // division
    let quotient = 56.7 / 32.2;
    let truncated = -5 / 3; // Results in -1

    // remainder
    let remainder = 43 % 5;
}
```

- Boolean Types
```rust
fn main() {
    let t = true;

    let f: bool = false; // with explicit type annotation
}
```

- character types 
```rust 
fn main() {
    let c = 'z';
    let z: char = 'ℤ'; // with explicit type annotation
    let heart_eyed_cat = '😻';
}
```


1. Compound types
They can group multiple values into one type
Rust has two primitive types. *tuples* and *arrays*
- Tuple types 
A _tuple_ is a general way of grouping together a number of values with a variety of types into one compound type. Tuples have a fixed length: Once declared, they cannot grow or shrink in size.
```rust 
fn main(){
	let tup: (i32, f64, u8) = (230, 6.2, 45)
}
```