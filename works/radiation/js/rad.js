
function Canvas(prefectures) {
  this.prefectures = prefectures;
}

Canvas.prototype = pv.extend(GOverlay);

Canvas.prototype.initialize = function(map) {
  this.map = map;
  this.canvas = document.createElement("div");
  this.canvas.setAttribute("class", "canvas");
  map.getPane(G_MAP_MAP_PANE).parentNode.appendChild(this.canvas);
};

Canvas.prototype.redraw = function(force) {
  if (!force) return;
  var c = this.canvas,
      m = this.map,
      r = 200;
 
  /* Get the pixel locations of the crimes. */
  var pixels = this.prefectures.map(function(d) {
    return m.fromLatLngToDivPixel(new GLatLng(d.lat, d.lon));
  });

  /* Update the canvas bounds. Note: may be large. */
  function x(p) p.x;
  function y(p) p.y;
  var x = { min: pv.min(pixels, x) - r, max: pv.max(pixels, x) + r };
  var y = { min: pv.min(pixels, y) - r, max: pv.max(pixels, y) + r };
  c.style.width = (x.max - x.min) + "px";
  c.style.height = (y.max - y.min) + "px";
  c.style.left = x.min + "px";
  c.style.top = y.min + "px";

  /* Render the visualization. */
  new pv.Panel()
      .canvas(c)
      .left(-x.min)
      .top(-y.min)
    .add(pv.Panel)
      .data(this.prefectures)
    .add(pv.Dot)
      .left(function() pixels[this.parent.index].x)
      .top(function() pixels[this.parent.index].y)
      .strokeStyle(function(x, d) "#900")
      //.strokeStyle(null)
      .fillStyle(function(x, d) "rgba(255, 0, 0, 0.7)")
      .size(function(x, d) 100 * d.radiation[1] * Math.pow(4, m.getZoom() - 5.0))
      //.size(100)
      .title(function(x, d) d.prefecture + d.city + ": " + d.radiation[1] + " μSv")
    /*
    .anchor("center").add(pv.Label)
      .textStyle("black")
      .text(function(x, d) d.prefecture)
    */
    .root.render();
};

/* Restrict minimum and maximum zoom levels. */
G_NORMAL_MAP.getMinimumResolution = function() 4;
G_NORMAL_MAP.getMaximumResolution = function() 10;

var map = new GMap2(document.getElementById("map"));
//map.setCenter(new GLatLng(37.78, -122.22), 12);
map.setCenter(new GLatLng(37.50, 138.50), 6);
map.setUI(map.getDefaultUI());
map.addOverlay(new Canvas(prefectures));