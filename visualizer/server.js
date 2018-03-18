/**
 * The Node.js server for visualizing the data.
 */

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

// Define aggregate queries
var weeklyAggregate = [
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
];
var dailyAggregate = [
  {
    $sort: {
      date: -1
    }
  },
  {
    $group: {
      _id: {
        year: { $year: '$date' },
        month: { $month: '$date' },
        day: { $dayOfMonth: '$date' }
      },
      data: {
        $push: {
          hour: { $hour: '$date' },
          minute: { $minute: '$date' },
          value: '$value'
        }
      }
    }
  }
];

/**
 * Request handler for data.js.
 * @param {*} req the request object
 * @param {*} res the response object
 * @param {*} weekly whether the weekly view should be displayed
 */
var dataRequestHandler = (req, res, weekly = true) => {
  MongoClient.connect(args.database, (err, conn) => {
    if (err) throw err;
    var db = conn.db(args.db);
    db.collection(args.collection).aggregate(weekly ? weeklyAggregate : dailyAggregate).toArray((err, result) => {
      if (err) throw err;
      res.write("var interval = " + args.interval + ";\n");
      res.write("var defaultValue = " + args.default + ";\n");
      res.write("var queryResult = " + JSON.stringify(result) + ";\n\n");
      res.end();
      conn.close();
    });
  });
}

// Create express app (send index.html file)
var app = express();

// Define main routes
app.get('/', (req, res) => res.sendFile(__dirname + '/index-weekly.html'));
app.get('/weekly', (req, res) => res.sendFile(__dirname + '/index-weekly.html'));
app.get('/daily', (req, res) => res.sendFile(__dirname + '/index-daily.html'));

// Define chart.js route (send chart.js file)
app.get('/chart.js', (req, res) => res.sendFile(__dirname + '/chart.js'));

// Define data.js route which queries the database and returns the result as a JS file 
app.get('/data-weekly.js', (req, res) => dataRequestHandler(req, res, true));
app.get('/data-daily.js', (req, res) => dataRequestHandler(req, res, false));

// Start the server
app.listen(args.port, args.host, () => {
  var url = 'http://' + args.host + ':' + args.port;
  console.log('started server');
  console.log('visit ' + url + '/weekly for the weekly view');
  console.log('visit ' + url + '/daily for the daily view');
});