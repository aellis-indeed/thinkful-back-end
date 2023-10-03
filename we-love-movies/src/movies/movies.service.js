const db = require("../db/connection");

async function list(is_showing) {
  return db("movies")
    .select("movies.*")
    .modify((queryBuilder) => {
      if (is_showing) {
        queryBuilder
          .join(
            "movies_theaters",
            "movies.movie_id",
            "movies_theaters.movie_id",
          )
          .where({ "movies_theaters.is_showing": true })
          .groupBy("movies.movie_id");
      }
    });
}

async function read(movie_id, theaters, reviews) {
  // TODO: Add your code here
  if (reviews) {
    const reviews = await db('reviews')
      .select('reviews.*')
      .join(
        'critics',
        'reviews.critic_id',
        'critics.critic_id'
      )
      .where({movie_id});
    for (const review in reviews) {
      const critic = (await db('critics').select('*').where({ critic_id: reviews[review].critic_id}))[0];
      reviews[review].critic = critic;
    };
    return reviews;
  }

  return db('movies')
    .select('movies.*')
    .where({ 'movies.movie_id': movie_id })
    .modify((queryBuilder) => {
      if (theaters) {
        queryBuilder
          .join(
            "movies_theaters",
            "movies.movie_id",
            "movies_theaters.movie_id",
          )
          .where({"movies_theaters.is_showing": true})
          .join(
            'theaters',
            'movies_theaters.theater_id',
            'theaters.theater_id'
          )
          .select('theaters.*')
      }
    });
}

module.exports = {
  list,
  read,
};
