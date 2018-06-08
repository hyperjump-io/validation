Deviations from JSON Schema
===========================

The following are things from the JSON Schema specification that I chose not to
include because they violate the archtectural contraints I have chosen.

* The `additionalProperties` and `additionalItems` keywords are not implmented.
* The `if`, `then`, and `else` keywords are not implemented.
* The `id` keyword does not change `$ref` resolution.

One of the experiments this project explores is the use of macros for extending
the capabilities of the system. Therefore, I have decided not to implment
keywords that amount purely to syntactic sugar. Those keywords are instead
implemented as macros. Those keywords include the following.

* `enum`
* Any `format` value that can be exressed as a regular expression
* `contains`
* `dependencies`
* The array form of `type`

Other changes

* The array form of `items` uses the name `tupleItems` instead of overloading `items`
