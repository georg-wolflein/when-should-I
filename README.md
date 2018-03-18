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