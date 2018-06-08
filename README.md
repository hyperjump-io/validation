JSON Schema-ish Utility
=======================

This is NOT a JSON Schema implementation. It is heavily inspired by JSON Schema,
but it is my vision of what I think JSON Schema should be as well as experiments
with where it could go.


Installation
------------

Usage
-----

```javascript
const schema = JsonSchema("#", `{
  "type": "object",
  "properties": {
    "foo": { "type": "string" }
  },
  "required": ["foo"]
}`);

const value1 = { "foo": "bar" };
const value2 = { "abc": 123 };

// Validate in one step
JsonSchema.validate(schema)(value1);

// Generate a validator from a schema and validate multiple instances
const validator = JsonSchema.validate(schema);
const result = validator(value);
ValidationResult.isValid(result);
```

Contributing
------------

I strongly encourage contributions from anyone wants to explore these ideas with
me. But, I will not accept changes that violate my chosen architecture no matter
how practically useful it might be for you.

### Tests

Run the tests

```bash
npm test
```

Run the tests with a continuous test runner
```bash
npm test -- --watch
```

Architectural Contraints
------------------------

TODO

Experiments
-----------

### Macros / Code on Demand

TODO

### REST / Hypermedia

TODO

Style / Values
--------------

### Functional Programming

I'm using a functional programming style that looks more like Clojure than
JavaScript. Maybe I should have wrote it in ClojureScript, but I didn't and it
is what it is.

### Small Footprint

Even though this project is primarily for exploration and experimentation, I
aim to keep the size small as if it were a production module.

### Efficiency

This implmentation aims to be as computationally efficient as possible without
compromising the quality of the code or any achitectural choices.

TODOs
-----

* Implement format
* Create a meta schema
* Err on invalid schema based on meta schema
* Detailed validation results
* Handle remote refs
* Clean up duplication in JsonReference
* Value as JSON Reference document
* maxLength and minLength for emojis
* refactor validatorList to not contain functions
* More detailed validation results
