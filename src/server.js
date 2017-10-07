var express = require("express");
var path = require("path");
var bodyParser = require('body-parser')
var app = express();
var webpack = require('webpack');
var node_env = process.env.NODE_ENV || 'development'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, '../dist')))

var serverPort = process.env.PORT || 8080;



if(node_env == 'development'){
    var config = require('./../webpack.config');
    var compiler = webpack(config);
     console.log('inside development')
          app.use(require('webpack-dev-middleware')(compiler, {
            publicPath: config.output.publicPath
          }));
     app.use(require('webpack-hot-middleware')(compiler));
  }




app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "./../dist/index.html"));
});

app.listen(serverPort, "localhost", function (err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log("Listening at http://localhost:" + serverPort);
});
