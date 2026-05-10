const express = require('express');
const cors = require('cors');
const fs = require('fs');

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const resolvers = require('./resolvers');
const typeDefs = fs.readFileSync('./schema.gql', 'utf8');

async function start() {
  const app = express();

  // ---------------- SAFE PROTO LOADING ----------------
  const moviePackageDef = protoLoader.loadSync('./movie.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

  const tvPackageDef = protoLoader.loadSync('./tvShow.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

  const movieProto = grpc.loadPackageDefinition(moviePackageDef).movie;
  const tvProto = grpc.loadPackageDefinition(tvPackageDef).tvShow;

  // ---------------- GRAPHQL ----------------
  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  await server.start();

  app.use(cors());
  app.use(express.json());
  app.use('/graphql', expressMiddleware(server));

  // ---------------- REST MOVIES ----------------
  app.get('/movies', (req, res) => {
    const client = new movieProto.MovieService(
      'localhost:50051',
      grpc.credentials.createInsecure()
    );

    client.SearchMovies({}, (err, response) => {
      if (err) return res.status(500).send(err);
      res.json(response.movies);
    });
  });

  app.get('/movies/:id', (req, res) => {
    const client = new movieProto.MovieService(
      'localhost:50051',
      grpc.credentials.createInsecure()
    );

    client.GetMovie({ movie_id: req.params.id }, (err, response) => {
      if (err) return res.status(500).send(err);
      res.json(response.movie);
    });
  });

  // ---------------- REST TV ----------------
  app.get('/tvshows', (req, res) => {
    const client = new tvProto.TVShowService(
      'localhost:50052',
      grpc.credentials.createInsecure()
    );

    client.SearchTvshows({}, (err, response) => {
      if (err) return res.status(500).send(err);
      res.json(response.tv_shows);
    });
  });

  app.get('/tvshows/:id', (req, res) => {
    const client = new tvProto.TVShowService(
      'localhost:50052',
      grpc.credentials.createInsecure()
    );

    client.GetTvshow({ tv_show_id: req.params.id }, (err, response) => {
      if (err) return res.status(500).send(err);
      res.json(response.tv_show);
    });
  });

  // ---------------- START ----------------
  app.listen(3000, () =>
    console.log("API Gateway running on http://localhost:3000")
  );
}

start();