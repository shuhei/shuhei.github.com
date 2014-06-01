(function() {
  var scene, camera, renderer;
  var world;
  var arcs;

  function init() {
    scene = new THREE.Scene();

    // Camera
    // Args: field of view, aspect ratio, near clipping place, far clipping plane.
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 60;

    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // World
    world = new THREE.Object3D();
    scene.add(world);

    arcs = [];
    addArcs();
  }

  function addArcs() {
    var arc, i;
    for (i = 0; i < 150; i++) {
      arc = createArc();
      arcs.push(arc);
      world.add(arc);
    }
  }

  function randomColor() {
    var probability = Math.random();
    if (probability < 0.3) {
      return blendColor(Math.random(), 220, 255, 0, 50, 120, 0);
    } else if (probability < 0.9) {
      return blendColor(Math.random(), 255, 100, 0, 255, 255, 0);
    } else {
      return new THREE.Color(1, 1, 1);
    }
  }

  function createArc() {
    var geom, material, arc, i, theta, padding;
    var probability;
    var shape, path;
    var angle;
    if (Math.random() < 0.1) {
      angle = Math.PI * (0.38 + Math.random() * 1.2);
    } else {
      angle = Math.PI * (0.3333 + Math.random() * 0.15);
    }

    var innerRadius = 2 + 30 * Math.random();
    var outerRadius;
    if (Math.random() < 0.1) {
      outerRadius = innerRadius + (3 + 3 * Math.random());
    } else {
      outerRadius = innerRadius + (1 + 2 * Math.random());
    }

    var color = randomColor();

    probability = Math.random();
    if (probability < 0.33333) {
      shape = new THREE.Shape();
      shape.moveTo(outerRadius * Math.cos(0), outerRadius * Math.sin(0));
      shape.absarc(0, 0, outerRadius, 0, angle, true);
      shape.lineTo(innerRadius * Math.cos(angle), innerRadius * Math.sin(angle));
      shape.absarc(0, 0, innerRadius, 0, angle, false);
      shape.lineTo(outerRadius * Math.cos(0), outerRadius * Math.sin(0));
      geom = new THREE.ShapeGeometry(shape);

      material = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        opacity: 0.8,
        transparent: true
      });

      arc = new THREE.Mesh(geom, material);
    } else if (probability < 0.66666) {
      angle = Math.PI / 12;
      padding = (angle) / 4 * 0.3;
      var shapes = [];
      for (i = 0; i < 5; i++) {
        theta = angle * i / 4;
        shape = new THREE.Shape();
        shape.moveTo(innerRadius * Math.cos(theta - padding), innerRadius * Math.sin(theta - padding));
        shape.lineTo(outerRadius * Math.cos(theta - padding), outerRadius * Math.sin(theta - padding));
        shape.lineTo(outerRadius * Math.cos(theta + padding), outerRadius * Math.sin(theta + padding));
        shape.lineTo(innerRadius * Math.cos(theta + padding), innerRadius * Math.sin(theta + padding));
        shape.lineTo(innerRadius * Math.cos(theta - padding), innerRadius * Math.sin(theta - padding));
        shapes.push(shape);
      }
      geom = new THREE.ShapeGeometry(shapes);

      material = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        opacity: 0.9,
        transparent: true
      });

      arc = new THREE.Mesh(geom, material);
    } else {
      arc = new THREE.Object3D();
      material = new THREE.LineBasicMaterial({ color: color });

      for (var radius = innerRadius; radius <= outerRadius; radius += 0.3) {
        // TODO: Bug of three.js? The clockwise arg should be `true`.
        shape = new THREE.ArcCurve(0, 0, radius, 0, angle, false);
        geom = new THREE.Geometry();
        shape.getPoints(30).forEach(function (point) {
          var vertex = new THREE.Vector3(point.x, point.y, point.z);
          geom.vertices.push(vertex);
        });

        arc.add(new THREE.Line(geom, material));
      }
    }

    arc.rotation.x = Math.PI * 2 * Math.random();
    arc.rotation.y = Math.PI * 2 * Math.random();
    arc.userData.vr = new THREE.Vector2(Math.random() * 0.01, Math.random() * 0.01);

    return arc;
  }

  function update() {
    arcs.forEach(function (arc) {
      arc.rotation.x += arc.userData.vr.x;
      arc.rotation.y += arc.userData.vr.y;
    });
  }

  function render() {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
  }

  function blendColor(fraction, red1, green1, blue1, red2, green2, blue2) {
    var red = interpolate(fraction, red1, red2) / 255;
    var green = interpolate(fraction, green1, green2) / 255;
    var blue = interpolate(fraction, blue1, blue2) / 255;
    return new THREE.Color(red, green, blue);
  }

  function interpolate(fraction, value1, value2) {
    var diff = value2 - value1;
    return value1 + diff * fraction;
  }

  init();
  render();
})();
