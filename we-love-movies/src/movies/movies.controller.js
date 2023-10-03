const service = require("./movies.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function movieExists(request, response, next) {
  // TODO: Add your code here.
  const { movieId } = request.params;
  const movies = await service.read(movieId);
  if (movies.length !== 0) {
    response.locals.movies = movies;
    return next();
  }

  next({status: 404, message: `${movieId}`});
}

async function read(request, response) {
  // TODO: Add your code here
  response.json({ data: response.locals.movies[0] });
}

async function list(request, response) {
  // TODO: Add your code here.
  const { is_showing } = request.query;
  const isShowing = is_showing !== undefined ? is_showing : false;
  const data = await service.list(isShowing);
  response.status(200).json({ data });
}

async function readTheaters (req, res) {
  const { movieId } = req.params;
  const movies = await service.read(movieId, true, false);
  res.status(200).json({ data: movies });
}

async function readReviews (req, res) {
  const { movieId } = req.params;
  const movies = await service.read(movieId, false, true);
  res.status(200).json({ data: movies });
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  read: [asyncErrorBoundary(movieExists), read],
  readTheaters: [asyncErrorBoundary(movieExists), readTheaters],
  readReviews: [asyncErrorBoundary(movieExists), readReviews],
};
