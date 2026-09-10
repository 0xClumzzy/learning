---

mindmap-plugin: markdown

---
1. Scalar types 
A scalar type represents a single value 
- intergers(int)
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































1. Compound types
