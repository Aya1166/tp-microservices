const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const movieProto = grpc.loadPackageDefinition(
  protoLoader.loadSync(path.join(__dirname, 'movie.proto'))
).movie;

const tvProto = grpc.loadPackageDefinition(
  protoLoader.loadSync(path.join(__dirname, 'tvShow.proto'))
).tvShow;

const movieClient = new movieProto.MovieService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

const tvClient = new tvProto.TVShowService(
  'localhost:50052',
  grpc.credentials.createInsecure()
);

module.exports = {
  Query: {
    movie: {
      resolve: (_, { id }) =>
        new Promise((resolve, reject) => {
          movieClient.GetMovie({ movie_id: id }, (err, res) => {
            if (err) reject(err);
            else resolve(res.movie);
          });
        })
    },

    movies: {
      resolve: () =>
        new Promise((resolve, reject) => {
          movieClient.SearchMovies({}, (err, res) => {
            if (err) reject(err);
            else resolve(res.movies);
          });
        })
    },

    tvShow: {
      resolve: (_, { id }) =>
        new Promise((resolve, reject) => {
          tvClient.GetTvshow({ tv_show_id: id }, (err, res) => {
            if (err) reject(err);
            else resolve(res.tv_show);
          });
        })
    },

    tvShows: {
      resolve: () =>
        new Promise((resolve, reject) => {
          tvClient.SearchTvshows({}, (err, res) => {
            if (err) reject(err);
            else resolve(res.tv_shows);
          });
        })
    }
  }
};