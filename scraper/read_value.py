#!/usr/bin/env python3

import argparse
import urllib.request as req
from urllib.error import HTTPError
import sys
import re
from datetime import datetime
from pymongo import MongoClient

DATE_FORMAT = "%Y-%m-%d %H:%M | "
VERBOSITY = 0
DISPLAY_DATE = False
USE_FLOAT = False
IGNORE_VALUE = None
QUANTIZE = 0

class RegexError(Exception): pass

def read_url(url):
  """Get the HTML contents of a web page."""
  fp = req.urlopen(url)
  mybytes = fp.read()
  html = mybytes.decode("utf8")
  fp.close()
  return html

def get_value(regex, html):
  """Get the value from the HTML code."""
  result = re.search(regex, html)
  if result == None:
    raise RegexError("could not match regex")
  if result.group("value") == None:
    raise RegexError("regex does not contain a capture group named \"value\"")
  return result.group("value")

def write_to_database(value, date, uri, database, collection):
  """Write the value to the database."""
  client = MongoClient(uri)
  db = client[database]
  coll = db[collection]
  if (USE_FLOAT):
    value = float(value)
  doc = { "date": date, "value": value }
  coll.insert_one(doc)

def main(regex, url, default, uri, database, collection):
  """Main function for getting the value, outputting, and saving to database."""
  now = datetime.now().replace(second = 0, microsecond = 0)
  if QUANTIZE != 0:
    now = now.replace(minute = now.minute - (now.minute % QUANTIZE))
  date = now.strftime(DATE_FORMAT) if DISPLAY_DATE else ""
  result = ""
  try:
    html = read_url(url)
    result = get_value(regex, html)
    if uri != None and result != IGNORE_VALUE:
      write_to_database(result, now, uri, database, collection)
  except KeyboardInterrupt:
    raise
  except Exception as e:
    if VERBOSITY == 0:
      result = default
    elif VERBOSITY == 1:
      result = str(e)
    else:
      raise e
  finally:
    print(date + str(result))

if __name__ == "__main__":
  # Define argument parser
  parser = argparse.ArgumentParser(description="Read a value from a URL")
  parser.add_argument("regex", type=str, help="the regular expression with the capture group \"value\" matching the value to be recorded")
  parser.add_argument("url", type=str, help="the URL")
  parser.add_argument("--default", type=str, metavar="VALUE", default="0", help="default value to be returned if there is an error and --verbose is not set (default is \"0\")")
  parser.add_argument("--database", type=str, metavar="URI", help="store the result in a database")
  parser.add_argument("--name", type=str, metavar="NAME", default="results", help="the database name to store the result in (default is \"results\")")
  parser.add_argument("--collection", type=str, metavar="COLL", default="results", help="the database collection to store the result in (default is \"results\")")
  parser.add_argument("--use-float", action="store_true", dest="float", help="specify that the value should be stored as a float")
  parser.add_argument("--ignore", type=str, metavar="VALUE", help="do not write to the database if this value occurs")
  parser.add_argument("--quantize", type=int, metavar="MINUTES", default="0", help="make sure the date is a multiple of the specified number of minutes")
  parser.add_argument("--date", "-d", action="store_true", help="print the date")
  parser.add_argument("--verbose", "-v", action="count", help="increase level of verbosity (can be supplied multiple times)", default=0)
  args = parser.parse_args()
  DISPLAY_DATE = args.date
  VERBOSITY = args.verbose
  USE_FLOAT = args.float
  IGNORE_VALUE = args.ignore
  QUANTIZE = args.quantize
  # Execute main function
  main(args.regex, args.url, args.default, args.database, args.name, args.collection)