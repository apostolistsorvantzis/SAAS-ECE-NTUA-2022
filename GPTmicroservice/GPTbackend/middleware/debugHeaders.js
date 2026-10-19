const debugHeaders = (req, res, next) => {
  res.on('header', (header) => {
    console.trace('header is about to be written', header);
  });
  next();
};

module.exports = debugHeaders;
