var calURL = "https://www.googleapis.com/calendar/v3/calendars/2o02frdlq63bi8rjipiuijq1l4%40group.calendar.google.com/events?&key=AIzaSyAHODXhRYNXD_rXz3ZclKNNrWLQzMkgfcw&maxResults=250";
var mapURL = "https://maps.google.com/maps?hl=en&q=";
var timeOptions = {
  weekday: "short", month: "long", day: "numeric", year: "numeric",
  hour: "numeric", minute: "numeric"
}
var getCalendar = function() {
  $.ajax({
    dataType: "json",
    url: calURL,
    success: function(data) {
      var events = data.items;
      addShows(events);
    }
  })
}

var addShows = function(items) {
  var sorted = sortEvents(items);
  addRows(sorted);
}

var sortEvents = function(events) {
  var current = [];
  var cutoff = Date.now() - 7200000;
  for (i = 0; i < events.length; i++) {
    var item = events[i];
    item['startTime'] = getTime(item);
    if (cutoff < Date.parse(item['startTime'])) {
      current.push(item);
    }
  };
  sorted = current.sort(function(a,b) {
    return a['startTime'] - b['startTime'];
  });

  return sorted;
}

var addRows = function(sorted) {
  for (i = 0; i < sorted.length; i++) {
    var item = sorted[i];
    var row = toRow(item);
    $("#shows").append(row);
  };
}

var getTime = function(item) {
  // var offsets = {"America/New_York": 3, "America/Chicago": 2, "America/Denver": 1}
  var startTime = new Date(item.start.dateTime);
  // var tz = item.start.timeZone;
  // if (offsets[tz]) {
  //   startMS = Date.parse(startTime);
  //   startTime = new Date(startMS + (3600000 * offsets[tz]));
  // }
  return startTime;
}

var toRow = function(item) {
  var showDate = item['startTime'];
  var dateString = showDate.toLocaleString('en-US', timeOptions);
  var title = item.summary;
  var showObject = toShowObject(item);
  var newRow = $("<tr>");
  newRow.append("<td>" + dateString + "</td>");
  newRow.append(titleString(showObject, title));
  newRow.append(whereString(item, showObject))
  return newRow;
}

var whereString = function(item, showObject) {
  var venue = setAttribute(showObject, "venue");
  var venueLink = setAttribute(showObject, "venue_link");

  var mapString = mapLink(item, venue);
  var venueURL = venuePageString(venueLink);

  var city = setAttribute(showObject, "city");
  city = (city == "TBD" ? "" : ", " + city);
  var state = setAttribute(showObject, "state");
  state = (state = "TBD" ? "" : ", " + state);

  if (venue == "TBD") {
    return "<td>" + mapString + "</td>"
  } else {
    return "<td>" + venue + city + state + " (" + venueURL + mapString + ")</td>"
  }
}

var mapLink = function(item, venue) {
  var mLink = mapURL + item.location.replace("'", "&apos;");
  var locString = item.location.replace(", United States", "");
  if (venue == "TBD") {
    return "<a href='" + mLink + "' target='_blank'>" + locString + "</a>"
  } else {
    return "<a href='" + mLink + "' target='_blank'>map</a>"
  }
}

var venuePageString = function(venueLink) {
  if (venueLink == "TBD") {
    return "";
  } else {
    return "<a href='" + venueLink + "' target='_blank'>site</a>, ";
  }
}

var toShowObject = function(item) {
  var description = !!item.description ? item.description : "";
  var chunks = description.split("\n");
  var show = {};
  chunks.forEach(function(chunk){
    var separate = chunk.search(":");
    var key = chunk.slice(0, separate);
    var object = chunk.slice(separate+2);
    show[key] = object;
  });
  return show;
}

var locationString = function(showObject) {

}

var setAttribute = function(showObject, attr) {
  if (!!showObject[attr]) {
    return showObject[attr];
  } else {
    return "TBD";
  }
}

var titleString = function(showObject, title) {
  var middle;
  var link = setAttribute(showObject, "link");
  if (!!showObject.link) {
    middle = "<a href='" + showObject.link + "' target='_blank'>" + title + "</a>";
  } else {
    middle = title;
  }
  return "<td>" + middle + "</td>"
}

$(document).ready(function() {
  getCalendar();
});
