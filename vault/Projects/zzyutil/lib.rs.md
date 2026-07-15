//core/src/lib.rs

```rust 
//module declaration 
pub mod inner;
pub mod config;


//reference counted pointer 
use std::rc::Rc;


```

- Module declarations. Rust doesn't have "import from file path" energy like Python — it has a whole module tree you build like a filing cabinet. This just says "there's a file called `inner.rs` (or `inner/mod.rs`), go read it." `pub` means other crates/modules outside this one are allowed to look. Without `pub`, it's private and everyone else gets a compile error and no explanation, very on-brand for Rust.
- Module declarations. Rust doesn't have "import from file path" energy like Python — it has a whole module tree you build like a filing cabinet. This just says "there's a file called `inner.rs` (or `inner/mod.rs`), go read it." `pub` means other crates/modules outside this one are allowed to look. Without `pub`, it's private and everyone else gets a compile error and no explanation, very on-brand for Rust.