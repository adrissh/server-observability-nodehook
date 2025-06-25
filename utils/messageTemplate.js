const messageTemplate = (templateString, data) => {
  let fieldString = templateString;

  for (const key in data) {
    const regex = new RegExp(`{${key}}`, "g");
    fieldString = fieldString.replace(regex, data[key]);
  }
  return fieldString;
};


module.exports = messageTemplate;