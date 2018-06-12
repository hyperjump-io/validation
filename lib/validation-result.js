export const isValid = (result) => {
  return result.every(([_pointer, isValid]) => isValid);
};
