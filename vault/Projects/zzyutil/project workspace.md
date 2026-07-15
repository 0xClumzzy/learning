# `[workspace]
This section tells Cargo that this is a workspace — a project that contains multiple smaller crates (packages).

`members = ["core","tui","xtask"]
defines whic folders are part of this workspace
- You must have a Cargo.toml inside each of these folders.

`default-members = ["tui", "core"]`
When you run commands like cargo build, cargo run, cargo test at the root, Cargo will build these members by default.

`resolver = "2`
It solves some complex dependency conflicts better than the old resolver.

# `[profile.release]
This section customizes how your program is compiled when you run cargo build --release.

- `opt-level = "z"` Optimize for **small binary size** (instead of raw speed). Good for a TUI tool.
- `lto = true `  **Link Time Optimization** — allows the compiler to optimize across all crates. Makes the binary smaller and sometimes faster.
- `codegen-units = 1` Reduces parallelism during compilation to allow better optimizations. Helps with LTO.
- `panic = "abort"` When the program panics, it immediately aborts instead of unwinding the stack. Makes binary smaller and faster (common in CLI tools).
- `strip = "true"` Removes debug symbols from the final binary → much smaller file size.
- `incremental = "false"` Disables incremental compilation in release mode. Usually better for final optimized builds.

[[project workspace]]
[[core.canvas]]
[[Cargo.toml]]
[[lib.rs]]
[[xtask.canvas]]
[[tui.canvas]]