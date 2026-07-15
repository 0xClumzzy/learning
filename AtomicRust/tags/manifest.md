# The anatomy of a toml file
 Cargo.toml is about describing your dependencies in a broad sense, and is written by you.
Package info
```toml
[
package
]
name="yomama"
version="old"
authors="meofc"
description="yo mama old"
license="whichone"
repository="inyobed"
home="yodontgotnone"


[
dependencies
]
yodaddy={version="alive",features="providing"}

[
dev_dependencies
]

[
build_dependencies
]

//binary target
[[
bin
]]
name="yoass"
path="yostupidbed"

//library target
[[
lib
]]

[
workspaces
]

```

Cargo.lock  contains exact information about your dependencies. It is maintained by Cargo and should not be manually edited
