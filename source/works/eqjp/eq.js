(function() {
  var now = new Date().getUTC;
  
  var po = org.polymaps;

  var map = po.map()
      .container(document.getElementById("map").appendChild(po.svg("svg")))
      .center({lat: 38.00, lon: 141.00})
      .zoom(6)
      .zoomRange([4, 10])
      .add(po.interact())
      .add(po.compass());

  map.add(po.image()
      .url(po.url("http://{S}tile.cloudmade.com"
      + "/5e8a32f7fc2b40e6ad72798704c6fe8c" // http://cloudmade.com/register
      + "/33458/256/{Z}/{X}/{Y}.png")
      .hosts(["a.", "b.", "c.", ""])));

  map.add(po.geoJson()
      .url(po.url("eq.json"))
      .on("load", load)
      .clip(false)
      .zoom(6));

  map.add(po.compass()
      .pan("none"));
      
  function klassName(h) {
    if (h < 6) return "h0-6";
    if (h < 24) return "h6-24";
    if (h < 48) return "h24-48";
    if (h < 72) return "h48-72";
    if (h < 96) return "h72-96";
    return "h96";
  }
  
  // http://stackoverflow.com/questions/3085937/safari-js-cannot-parse-yyyy-mm-dd-date-format
  function parseDate(input) {
    var format = 'yyyy-mm-ddTHH:MM:SS+09:00';
    var parts = input.match(/(\d+)/g),
        i = 0, fmt = {};
    // extract date-part indexes from the format
    format.replace(/(yyyy|mm|dd|HH|MM|SS)/g, function(part) { fmt[part] = i++; });
    
    return Date.UTC(
      parts[fmt['yyyy']], parts[fmt['mm']] - 1, parts[fmt['dd']],
      parts[fmt['HH']] - 9, parts[fmt['MM']], parts[fmt['SS']]
    );
  }
  
  function load(e) {
    for (var i = 0; i < e.features.length; i++) {
      var feature = e.features[i];
      var props = feature.data.properties;
      //var hoursPassed = (new Date().getTime() - parseDate(props.time)) / (60 * 60 * 1000);
      var hoursPassed = (1300078040000 - parseDate(props.time)) / (60 * 60 * 1000);
      console.log(hoursPassed); 
      
      feature.element.appendChild(
        po.svg("title")
        .appendChild(document.createTextNode("M" + props.mag + ": " +props.time + " @ " + props.region))
        .parentNode
      );
      
      feature.element.setAttribute("r", Math.pow(5.6231, props.mag) / 10000.0);
      feature.element.setAttribute("class", klassName(hoursPassed));
    }
  }
})();
