JSON Validation
===============

JSON Validation is a media type for describing and validating the structure of
JSON data. Over the years, I've written a lot of JSON Schemas and helped others
in all kinds of domains write their JSON Schemas. JSON Validation is a
re-imaginging of JSON Schema based on my experiences and knowledge. In part,
it's an implementation of how I would define JSON Schema if given a blank slate,
but mostly I'm using this implementation as a sandbox to try out new ideas and
approaches to the JSON Schema style.

A JSON Validation document is a [JSON Reference](https://github.com/jdesrosiers/json-reference)
document and has the content type `application/validation+json`. To understand
JSON Validation, you should first understand JSON Reference. Beware that this is
not quite the same JSON Reference that is used in JSON Schema.

A JSON Validation document is a delarative set of constraints that a JSON
document must conform to in order to be considered valid. The JSON Validation
document is parsable into a pure function that can be used to validate a JSON
document in any language.

Installation
------------

Usage
-----

```http
GET http://validation.hyperjump.com/example1 HTTP/1.1
Accept: application/reference+json
```

```http
HTTP/1.1 200 OK
Content-Type: application/validation+json

{
  "type": "object",
  "properties": {
    "foo": { "type": "string" }
  },
  "required": ["foo"]
}
```

```javascript
(async () => {
  // Get a validation document
  const doc = await JsonValidation.get("http://validation.hyperjump.com/example1");

  // Get a validator function from a validation document
  const validate = await JsonValidation.validate(doc);

  const result1 = validate({ "foo": "bar" });
  ValidationResult.isValid(result1); // => true

  const result2 = validate({ "abc": 123 });
  ValidationResult.isValid(result2); // => false
}());
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

Philosophy and Architectural Contraints
---------------------------------------

### JSON

JSON Validation does just what it says it does; It validates JSON. Is not
intended for validating programming language specific types or data structures.

### Client-Server

JSON Validation is designed to be used as part of a client-server architecture.
Therefore JSON Validation documents, must be identified by a URL and must be
retrieveable.

### Layered System

JSON Validation should be composable at as many levels as possible. There are a
set of predefined keywords. New keywords can be defined as a composition of
other keywords. (coming soon)

A JSON Validation document is a collection of keywords. Each keyword adds a
constraint. An empty JSON Validation document (`{}`) has no contraints. All JSON
documents are valid. Each keyword adds a constraint further narrowing what
constitutes a valid document.

### Stateless

All keywords are stateless. The result of validating a keyword is dependent
only on the value being validated and the keyword value. A keyword can not be
dependent on another keyword or any external data.

### Cache

JSON Validation documents are immutable and should be cacheable forever. Once
published, they should never change. If they need to change, a new document
should be created that is identified by a unique URL.

### Uniform Interface

JSON Validation documents should validate the same way no matter what language
the validator is implemented in. Each document identifies what keywords the
implementation must support. Generating a validation function should result in
an error if the implementation doesn't support one or more of the the keywords
in the JSON Validation document. (coming soon)

The result of validating a JSON document should follow a standardized structure.
(coming soon)

### Code on Demand

For the things that can't be described as keywords, it should be possible to
describe a keyword implementation using JavaScript (coming soon).

TODOs
-----

* Keywords as URLs
* Keywords must be declared
* More detailed validation results
* Value as JSON Reference document
* Keyword composition
* Error message keyword
* `$data` keyword
* JSON serializable validators
