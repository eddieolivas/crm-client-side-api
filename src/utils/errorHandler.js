const handleError = (error, res) => {
  console.log("FUCK ME");
  res.status(error.status || 500);
  res.json({ message: error.message });
};

module.exports = handleError;
