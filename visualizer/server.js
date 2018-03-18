var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var fs = require('fs');
var args = require('yargs')
  .usage('$0 [options]')
  .option('host', {
    default: '127.0.0.1',
    describe: 'the hostname',
    type: 'string'
  })
  .option('port', {
    default: 3000,
    describe: 'the port to listen on',
    type: 'number'
  })
  .option('default', {
    default: 0,
    describe: 'number to display if a data point is not defined',
    type: 'number'
  })
  .option('interval', {
    default: 15,
    describe: 'the interval (in minutes) that data points should be graphed',
    type: 'number'
  })
  .option('database', {
    default: 'mongodb://127.0.0.1:27017/',
    describe: 'the URI to the database server',
    type: 'string'
  })
  .option('db', {
    default: 'results',
    describe: 'the name of the database',
    type: 'string'
  })
  .option('collection', {
    default: 'results',
    describe: 'the name of the database collection',
    type: 'string'
  })
  .help('help', 'show help')
  .version(false)
  .argv

var app = express();

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

app.get('/chart.js', (req, res) => res.sendFile(__dirname + '/chart.js'));

app.get('/data.js', (req, res) => {
  MongoClient.connect(args.database, (err, conn) => {
    if (err) throw err;
    var db = conn.db(args.db);
    db.collection(args.collection).aggregate([
      {
        $sort: {
          date: -1
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            week: { $week: '$date' }
          },
          data: {
            $push: {
              day: { $dayOfWeek: '$date' },
              hour: { $hour: '$date' },
              minute: { $minute: '$date' },
              value: '$value'
            }
          }
        }
      }
    ]).toArray((err, result) => {
      if (err) throw err;
      res.write("var interval = " + args.interval + ";\n");
      res.write("var defaultValue = " + args.default + ";\n");
      res.write("var queryResult = " + JSON.stringify(result) + ";\n\n");
      res.end();
      conn.close();
    });
  });
});

app.listen(args.port, args.host, () => console.log('navigate to http://' + args.host + ':' + args.port + '/'));