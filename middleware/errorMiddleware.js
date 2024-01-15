export const notFound = (req, res, next) => {
  const error = new Error(`not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorMessage = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === "CastError" && err.kind === "ObjectId") {
    (statusCode = 404), (message = "Resource not found");
  }

  res.status(statusCode).json({
    message,
  });
};
