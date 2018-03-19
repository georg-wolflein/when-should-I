# When should I?
- When should I go to the gym such that it isn't too crowded?
- When should I gas up such that the fuel is cheap?
- When should I ...?

This project provides a two-part solution for finding the optimum time of day or week to carry out a certain task:

1. A _scraper_ that periodically queries a defined website to record the current value of the service (such as price, occupancy, etc.).
2. A _visualizer_ that visualizes the scraped data in a graph that allows week-by-week and day-by-day comparison, enabling you to make an informed decision. 

This solution requires that there is a web page containing some sort of live measurement relating to the problem, for example:
- the website of your gym if it displays the current number of people in the gym
- the website of your gas station if it displays the current price of fuel

## Scraper

The scraper is written in `python`. It queries the specified the data, fetches the requested value (defined by a regular expression), and optionally stores the result in a `mongodb` database. 

### Set up the scraper

1. Install `python3` and `mongodb` and run the following:

   ```bash
   cd scraper
   pip3 install -r requirements.txt
   ```

2. Start `mongodb` (usually with the command `mongod`).
3. Set up a cronjob (`crontab -e`) at an interval of your choosing that runs
   ```
   ./read_value.py {regex} {url} --database {dburi}
   ```
   where
   - `regex` is a regular expression with the capture group named "value" matching the value to be recorded, for example `diesel\s?:\s(?P<value>\d+\.\d+)` will match `1.29` in `diesel: 1.29`
   - `url` is the URL to the website that contains the data
   - `dburi` is the URI to the running instance of mongodb
    
Note that if the interval is a value other than 15 minutes, you need to specify the `--interval` option of the visualizer (see next part).

For a full list of command-line options, run `./read_value.py --help`.


## Visualizer

The visualizer is a simple web server written in `Node.js`. It graphs the scraped data stored in a `mongodb` database such that the data can be compared week by week. 

### Set up the visualizer

1. Install `Node.js` and `npm` and run the following: 
   ```bash
   cd visualizer
   npm install
   ```
2. Start the server with
   ```
   node server.js
   ```
   Note that you may need to supply some additional command line arguments, depending on your setup. Run `node server.js --help` for more information.
3. Open one of the URLs displayed by the previous command (one is for daily, the other for weekly comparison). 

For a full list of command-line options, run `node server.js --help`.

## Help

Command info for the scraper:
```
$ ./read_value.py --help
usage: read_value.py [-h] [--default VALUE] [--database URI] [--name NAME]
                     [--collection COLL] [--use-float] [--ignore VALUE]
                     [--quantize MINUTES] [--date] [--verbose]
                     regex url

Read a value from a URL

positional arguments:
  regex               the regular expression with the capture group "value"
                      matching the value to be recorded
  url                 the URL

optional arguments:
  -h, --help          show this help message and exit
  --default VALUE     default value to be returned if there is an error and
                      --verbose is not set (default is "0")
  --database URI      store the result in a database
  --name NAME         the database name to store the result in (default is
                      "results")
  --collection COLL   the database collection to store the result in (default
                      is "results")
  --use-float         specify that the value should be stored as a float
  --ignore VALUE      do not write to the database if this value occurs
  --quantize MINUTES  make sure the date is a multiple of the specified number
                      of minutes
  --date, -d          print the date
  --verbose, -v       increase level of verbosity (can be supplied multiple
                      times)
```

Command info for the visualizer:

```
$ node server.js --help
server.js [options]

Options:
  --host        the hostname                     [string] [default: "127.0.0.1"]
  --port        the port to listen on                   [number] [default: 3000]
  --base        the base URL of the server, excluding leading and trailing
                backslash                                 [string] [default: ""]
  --interval    the interval (in minutes) that data points should be graphed
                                                          [number] [default: 15]
  --database    the URI to the database server
                                [string] [default: "mongodb://127.0.0.1:27017/"]
  --db          the name of the database           [string] [default: "results"]
  --collection  the name of the database collection[string] [default: "results"]
  --help        show help                                              [boolean]
```