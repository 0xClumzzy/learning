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
Each signed variant can store numbers from $$-(2^{n-1})to 2^{n-1}-1  $$
1. Compound types
