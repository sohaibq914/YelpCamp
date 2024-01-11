// checks if the async function causes an error

module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next); // if error then go to error-handling middleware
  };
};
