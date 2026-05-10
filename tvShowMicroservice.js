const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDef = protoLoader.loadSync('./tvShow.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const tvProto = grpc.loadPackageDefinition(packageDef).tvShow;

const service = {
  GetTvshow: (call, cb) => {
    cb(null, {
      tv_show: {
        id: call.request.tv_show_id,
        title: "Breaking Bad",
        description: "Crime series"
      }
    });
  },

  SearchTvshows: (call, cb) => {
    cb(null, {
      tv_shows: [
        { id: "1", title: "Breaking Bad", description: "Crime drama" },
        { id: "2", title: "Dark", description: "Sci-fi thriller" }
      ]
    });
  }
};

const server = new grpc.Server();
server.addService(tvProto.TVShowService.service, service);

server.bindAsync(
  "0.0.0.0:50052",
  grpc.ServerCredentials.createInsecure(),
  () => console.log("TV service running on 50052")
);