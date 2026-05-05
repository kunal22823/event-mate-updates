const SIES_EMAIL_REGEX = /^[a-zA-Z]+\.[a-z]{2,5}\d{2}@siescoms\.sies\.edu\.in$/;

const isValidSIESEmail = (email) => {
  return SIES_EMAIL_REGEX.test(email);
};

module.exports = { SIES_EMAIL_REGEX, isValidSIESEmail };
