const nil = "";

const escape = (segment) => segment.toString().replace("~", "~0").replace("/", "~1");
const unescape = (segment) => segment.toString().replace("~0", "~").replace("~1", "/");

const decons = (pointer) => {
  const ndx = pointer.indexOf("/", 1);
  const [segment, remainingPointer] = (ndx === -1) ?
    [pointer.slice(1), nil] : [pointer.slice(1, ndx), pointer.slice(ndx)];

  return [unescape(segment), remainingPointer];
};

const cons = (head, tail) => {
  return "/" + escape(head) + tail;
};

const append = (pointer, segment) => {
  return pointer + "/" + escape(segment);
};

const get = (value, pointer = nil) => {
  if (pointer === nil) {
    return value;
  } else {
    const [segment, remainingPointer] = decons(pointer);
    return get(value[segment], remainingPointer);
  }
};

module.exports = { append, cons, decons, get, nil };
