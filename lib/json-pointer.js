module.exports = {
  get : (pointer, subject) => {
    const pathPieces = pointer.split("/");
    pathPieces.shift();

    return pathPieces.reduce((result, key) => result[key], subject);
  }
}
