JSON Spec
=========

JSON Spec is a media type for describing and validating the structure of JSON data.

Installation
------------

Usage
-----

```javascript
const spec = JsonSpec("#", `{
  "type": "object",
  "properties": {
    "foo": { "type": "string" }
  },
  "required": ["foo"]
}`);

const value1 = { "foo": "bar" };
const value2 = { "abc": 123 };

// Validate in one step
JsonSpec.validate(spec)(value1);

// Generate a validator from a spec and validate multiple instances
const validator = JsonSpec.validate(spec);

const result = validator(value);
const isValid = ValidationResult.isValid(result);
```

Contributing
------------

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

### Stateless

All keywords are stateless. The result of validating a keyword is dependent
only on the value being validated an the keyword value. A keyword can not be
dependent on another keyword or any external data.

Experiments
-----------

### Modular System

There is no single meta-spec. Instead, each keyword has its own meta-spec and
the spec defines which keywords that validators should enforce.

### Macros

The goal is to keep the number of keywords in the specificaiton to the smallest
number possible and to use something like macros to define keywords that are
just syntactic sugar.

For example an `enum` keyword is unnecessary because `"enum": ["a", "b"]` is
syntactic sugar for `"anyOf": [{ "const": "a" }, { "const": "b" }]`.

### Code on Demand

For the things that can't be described as macros, it's possible to describe a
keyword implementation using JavaScript. Even the built-in keywords can be
described like this making validator implementations trivial in any language
with a JavaScript runtime.

TODOs
-----

* Implement format
* Create a meta spec for each keyword
* Err on invalid spec based on meta spec
* Detailed validation results
* Value as JSON Reference document
* maxLength and minLength for emojis
* More detailed validation results
