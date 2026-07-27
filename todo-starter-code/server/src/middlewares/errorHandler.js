export const HandleError = (err, req, res, next) => {
  console.error("Global error!!", err.stack);

  res.status(500).json({
    message: "Internal Server Error",
  });
};
