function addTime(date, value, type) {
  var timestamp = date.getTime();
  var diff = value * 1000;
  if (type === 's') {

  }
  if (type === 'm') {
    diff *= 60;
  } else if (type === 'h') {
    diff *= 3600;
  }
  return new Date(Math.floor(timestamp + diff));
}

module.exports = {
  addMinutes: function(date, minutes) {
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  },
  addMinutesClone: function(date, minutes) {
    return addTime(date, minutes, 'm');
  },
  addSeconds: function(date, seconds) {
    date.setSeconds(date.getSeconds() + seconds);
    return date;
  },
  addSecondsClone: function(date, seconds) {
    return addTime(date, seconds, 's');
  },
  addHours: function(date, hours) {
    date.setHours(date.getHours() + hours);
    return date;
  },
  addHoursClone: function(date, hours) {
    return addTime(date, hours, 'h');
  },
  setNextTime: function(date, minutes) {
    var newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return newDate;
  },
  intervalHours: function(timestamp) {
    return timestamp / 1000 / 60 / 60;
  }
};