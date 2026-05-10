const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const movieProto = grpc.loadPackageDefinition(
  protoLoader.loadSync('movie.proto')
).movie;

const service = {
  GetMovie: (call, cb) => {
    cb(null, {
      movie: {
        id: call.request.movie_id,
        title: "Inception",
        description: "Sci-fi movie"
      }
    });
  },

  SearchMovies: (call, cb) => {
    cb(null, {
      movies: [
        { id: "1", title: "Movie 1", description: "Desc 1" },
        { id: "2", title: "Movie 2", description: "Desc 2" }
      ]
    });
  }
};

const server = new grpc.Server();
server.addService(movieProto.MovieService.service, service);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => console.log("Movie service running on 50051")
);