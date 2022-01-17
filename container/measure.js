const arr = {
  max: function (array) {
    return Math.max.apply(null, array);
  },

  min: function (array) {
    return Math.min.apply(null, array);
  },

  range: function (array) {
    return arr.max(array) - arr.min(array);
  },

  sum: function (array) {
    var num = 0;
    for (var i = 0, l = array.length; i < l; i++) num += array[i];
    return num;
  },

  mean: function (array) {
    return arr.sum(array) / array.length;
  },
};

const measures = {};
const measureStat = {};
function startProfile(name) {
  performance.mark("B:" + name);
}
function endProfile(name) {
  performance.mark("E:" + name);
  const measure = performance.measure(name, "B:" + name, "E:" + name);
  if (measures[name] === undefined) {
    measures[name] = [];
    measureStat[name] = {};
  }

  measures[name].push(measure.duration);
  if (measures[name].length > 2000) {
    measures[name].shift();
  }

  performance.clearMarks("B:" + name);
  performance.clearMarks("E:" + name);
  performance.clearMeasures(name);
}

setInterval(() => {
  for (const key in measures) {
    measureStat[key]["avg"] = arr.mean(measures[key]);
    console.log(key, measureStat[key]);
  }
  if (
    document.getElementById("handle_duration") &&
    measureStat["HandleFrame"]
  ) {
    document.getElementById("handle_duration").innerHTML = parseFloat(
      measureStat["HandleFrame"]["avg"]
    ).toFixed(4);
  }
  console.log("-------------------------------------------------");
}, 1000);
