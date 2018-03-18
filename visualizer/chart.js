// Defined variables: queryResult, interval, defaultValue

var graphData = [];

var colors = [
  'rgb(255, 99, 132)',
  'rgb(255, 159, 64)',
  'rgb(255, 205, 86)',
  'rgb(75, 192, 192)',
  'rgb(54, 162, 235)',
  'rgb(153, 102, 255)',
  'rgb(201, 203, 207)'];

var labels = [];
var weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
for (var day = 0; day < weekdays.length; day++) {
  var weekday = weekdays[day];
  for (var minuteOfDay = 0; minuteOfDay < 60 * 24; minuteOfDay += interval) {
    var hour = Math.floor(minuteOfDay / 60);
    var minute = minuteOfDay % 60;
    if (hour < 10) hour = "0" + hour;
    if (minute < 10) minute = "0" + minute;
    labels.push(weekday + ' ' + hour + ':' + minute);
  }
}

// Data is stored in a variable named 'queryResult'
var datasets = [];
queryResult.forEach(doc => {
  var year = doc._id.year;
  var week = doc._id.week;
  var data = [];
  for (var i = 0; i < 7 * 24 * 60; i += interval) {
    var day = Math.floor(i / (24 * 60)) + 1;
    var hour = Math.floor(i / 60) % 24;
    var minute = i % 60;
    var result = doc.data.find(res => res.day == day && res.hour == hour && res.minute == minute);
    var value = result == undefined ? defaultValue : result.value;
    data.push(value);
  }
  datasets.push({
    label: week + ' (' + year + ')',
    backgroundColor: colors[week % colors.length],
    borderColor: colors[week % colors.length],
    data: data,
    fill: false,
  });
});

// Hide until current week by default
datasets.map(function (x) {
  if (x != datasets[datasets.length - 1]) x.hidden = true;
  return x;
});

var populateChart = elem => {
  var ctx = elem.getContext('2d');
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: labels,
      datasets: datasets
    },

    // Configuration options go here
    options: {
      scales: {
        yAxes: [{
          ticks: {
            //suggestedMin: 0,
            //suggestedMax: 100
          }
        }]
      }
    }
  });
};