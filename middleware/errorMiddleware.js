exports.notFound = (req, res) => res.status(404).json({
  status: false,
  message: `Route not found: ${req.method} ${req.originalUrl}`,
  errors: [],
});

exports.errorHandler = (error, req, res, next) => {
  console.error("Unhandled error:", error.message);
  if (res.headersSent) return next(error);
  return res.status(500).json({
    status: false,
    message: "Something went wrong",
    errors: [],
  });
};
