# Hyperjump Validation

Hyperjump Validation is a media type for describing the validation of data.
Over the years, I've written a lot of [JSON Schema][jsonschema]s and helped
others in all kinds of domains write their JSON Schemas. Hyperjump Validation is
a re-imagining of JSON Schema based on my experiences and knowledge. In part,
it's how I would define JSON Schema if given a blank slate, but mostly I'm using
this implementation as a sandbox to try out new ideas and approaches to the JSON
Schema style.

A Hyperjump Validation document is a [JSON Reference][jref] (JRef) document and
has the content type `application/validation+json`. To understand Hyperjump
Validation, you first need to understand [JRef][jref]. JRef is similar to `$ref`
in JSON Schema, but it differs in subtle yet important ways.

A Hyperjump Validation document is a declarative set of constraints that a
document must conform to in order to be considered valid. The Hyperjump
Validation document is parsable into a pure function that can be used to
validate a JSON or [JRef][jref] document in any language.

You can try out Hyperjump Validation in your browser at
https://validate.hyperjump.io.

## Installation

```bash
npm install @hyperjump/validation --save
```

## Usage

```http
GET https://example.com/example1 HTTP/1.1
Accept: application/validation+json
```

```http
HTTP/1.1 200 OK
Content-Type: application/validation+json

{
  "$meta": { "$href": "https://validation.hyperjump.io/common" },
  "type": "object",
  "properties": {
    "foo": { "type": "string" }
  },
  "required": ["foo"]
}
```

```http
GET https://example.com/subject1 HTTP/1.1
Accept: application/reference+json
```

```http
HTTP/1.1 200 OK
Content-Type: application/reference+json

{
  "foo": { "$href": "#/bar" },
  "bar": "abc"
}
```

```http
GET https://example.com/subject2 HTTP/1.1
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/reference+json

{ "foo": 123 }
```

```javascript
const Hyperjump = require("@hyperjump/browser");
const Validation = require("@hyperjump/validation");

(async function () {
  // Get a validator function from a validation document
  // Throws an exception if the validation document is invalid
  const example1 = Hyperjump.fetch("https://example.com/example1");
  const validate = await Validation.validate(example1);

  // Validate JavaScript data
  const subject0 = { "foo": "bar" };
  const result0 = validate(subject0);
  Validation.isValid(result0); // => true

  // Validate a JRef document
  const subject1 = Hyperjump.fetch("https://example.com/subject1");
  const result1 = validate(subject1);
  Validation.isValid(result1); // => true

  // Validate a JSON Document
  const subject2 = Hyperjump.fetch("https://example.com/subject2");
  const result2 = validate(subject2);
  Validation.isValid(result2); // => false
}());
```

## $meta

Every Hyperjump Validation document should have a `$meta` property at it's root
that defines which validation constraint keywords it uses. For most people,
you'll probably just need to put the following line at the top of each Hyperjump
Validation document.

```javascript
{
  "$meta": { "$href": "https://validation.hyperjump.io/common" }
}
```

The value of `$meta` is an object whose property names are constraint keywords
and property values are URLs pointing to a Hyperjump Validation document that
can be used to validate usages of the constraint keyword. This concept is like
the JSON Schema meta-schema except there is a meta-schema for each constraint
keyword rather than one for the entire document.

### Custom Constraint Keywords

You can customize Hyperjump Validation in all kinds of ways with `$meta`. You
can,

* Add a new keyword to the standard vocabulary
* Create a completely custom vocabulary
* Rename an existing keyword
* Combine keywords from different vocabularies to make your own

You can use custom keywords in your keyword validation documents, but if you
stick to standard keywords, then implementations that only know the standard
keywords can at least validate that your custom keyword is used correctly even
if it doesn't know how to apply the constraint when validating a document.

You can add an implementation for a keyword as a plugin using the `addKeyword`
function. All of the standard keywords are implemented as plugins so you can use
those as examples for how to create your own.

## Standard Vocabulary

I'll fill in documentation for these eventually. For the most part, these are a
subset of the JSON Schema keywords.

### allOf
### anyOf
### const
### definitions
### exclusiveMaximum
### exclusiveMinimum
### items
### maxItems
### maxLength
### maxProperties
### maximum
### minItems
### minLength
### minProperties
### minimum
### multipleOf
### not
### oneOf
### pattern
### patternProperties
### properties
### propertyNames
### required
### tupleItems
### type
### uniqueItems
### validation

## Contributing

### Tests

Run the tests

```bash
npm test
```

Run the tests with a continuous test runner
```bash
npm test -- --watch
```

## API

## Philosophy and Architectural Constraints

### JSON

The standard keywords are designed for validating JSON data. That includes media
types that extend JSON such as JRef. However, Hyperjump Validation can validate
native JavaScript data as well as Hyperjump documents which can be any media
type. When validating non-JSON data, all data is effectively converted to JSON
and that value is validated.

This might sound strange, but in order to have interoperability between
languages, there needs to be a common set of types. JSON fits that bill as well
as anything. Every language knows how to work with JSON.

### Client-Server

Hyperjump Validation is designed to be used as part of a client-server
architecture. Therefore Hyperjump Validation documents must be identified by a
URL and the document must be retrievable from that URL. It's not just an
identifier, it's a locator.

### Layered System

Hyperjump Validation should be composable at as many levels as possible. There
are a set of predefined keywords. New keywords can be defined as a composition
of other keywords. (coming soon)

A Hyperjump Validation document is a collection of keywords. Each keyword adds a
constraint. An empty Hyperjump Validation document (`{}`) has no constraints.
All JSON documents are valid. Each keyword adds a constraint further narrowing
what constitutes a valid document.

### Stateless

All keywords are stateless. The result of validating a keyword is dependent
only on the value being validated and the keyword value. A keyword can not be
dependent on another keyword or any external data.

### Cache

The server should define how a Hyperjump Validation document can be cached by
the client. This can be done through the standard HTTP cache mechanisms. It's
recommended that Hyperjump Validation documents should be immutable and
cacheable forever. Once published, they should never change. If they need to
change, a new document should be created that is identified by a unique URL.

### Uniform Interface

Hyperjump Validation keywords should validate the same way no matter what
language the validator is implemented in. The result of validating a JSON
document should follow a standardized structure. (coming soon)

## TODOs

* More detailed validation results
* `$data` keyword
* Keyword composition

[jref]: https://github.com/hyperjump-io/browser/blob/master/lib/json-reference/README.md
[jsonschema]: https://json-schema.org
