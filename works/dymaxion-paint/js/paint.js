jQuery(function($) {
  var stats,
      camera,
      scene,
      renderer,
      geometry,
      material,
      mesh,
      //projector,
      //particleMaterial,
      paper,
      dragged = false,
      before,
      color;

  var h = Math.sqrt(3) / 2;
  var target = [
    [0, 0],
    []
  ];
  
  init();
  animate();
  
  function init() {
    container = document.getElementById('container');
    
    /*
    projector = new THREE.Projector();
    particleMaterial = new THREE.ParticleCanvasMaterial({
      color: 0x000000,
      program: function (context) {
        context.beginPath();
        context.arc(0, 0, 1, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
      }
    });
    */
    
    camera = new THREE.Camera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    camera.position.z = 500;
    scene = new THREE.Scene();

    geometry = new Dymaxion();

    var canvas = getCanvas();
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    material = new THREE.MeshBasicMaterial({
      map: texture
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.scale.x = mesh.scale.y = mesh.scale.z = 200;
    mesh.doubleSided = true;
    scene.addObject(mesh);
    
    // TODO Make this work on WebGLRenderer.
    // Object3D.dynamic and Geometry.__dirty* may be related to this issue.
    // renderer = new THREE.WebGLRenderer();
    renderer = new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);
    
    initStats();
    
    initPalette();
    
    // Add paper to draw
    paper = document.getElementById('paper');
    paper.appendChild(canvas);

    paper.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }, false);

    canvas.addEventListener('mousedown', onCanvasMouseDown, false);

    canvas.addEventListener('mouseup', function(e) {
      e.stopPropagation();
      e.preventDefault();
      dragged = false;
      before = null;
    }, false);

    canvas.addEventListener('mousemove', onCanvasMouseMove, false);

    document.addEventListener('click', onDocumentClick, false);

    TWEEN.start();
  }
  
  function initStats() {
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);
  }
  
  function initPalette() {
    var colors = $('#palette li');
    var first = colors.first();
    color = first.data('color');
    first.addClass('selected');
    colors.each(function() {
      var li = $(this);
      li.css({'background-color': li.data('color')});
    });
    colors.click(function() {
      var selected = $(this);
      color = selected.data('color');
      colors.removeClass('selected');
      selected.addClass('selected');
    });
  }
  
  function onCanvasMouseDown(e) {
    e.stopPropagation();
    e.preventDefault();
    dragged = true;
    var x = e.clientX - (paper.offsetLeft + this.offsetLeft);
    var y = e.clientY - (paper.offsetTop + this.offsetTop);
    before = {x:x, y:y};
  }
  
  function onCanvasMouseMove(e) {
    e.stopPropagation();
    e.preventDefault();
    
    if (dragged) {
      var x = e.clientX - (paper.offsetLeft + this.offsetLeft);
      var y = e.clientY - (paper.offsetTop + this.offsetTop);
      if (before) {
        var context = this.getContext('2d');
        context.strokeStyle = context.fillStyle = color;
        context.lineWidth = 20;
        context.lineJoin = 'round';
        context.lineCap = 'round';

        context.beginPath();
        context.moveTo(before.x, before.y);
        context.lineTo(x, y);
        context.closePath();
        context.stroke();

        context.beginPath();
        context.arc(before.x, before.y, context.lineWidth / 2, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();

        context.beginPath();
        context.arc(x, y, context.lineWidth / 2, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
      }
      before = {x:x, y:y};
    }
  }
  
  function onDocumentClick(e) {
    e.preventDefault();
    /*
    var intersects = getIntersects(e);
    if (intersects.length > 0) {
      console.log(intersects);

      var particle = new THREE.Particle(particleMaterial);
      particle.position = intersects[ 0 ].point;
      particle.scale.x = particle.scale.y = 8;
      scene.addObject(particle);

      return;
    }
    */
    if (geometry.folded) {
      geometry.unfold();
      new TWEEN.Tween(mesh.rotation).to({
        x: 0,
        y: 0,
        z: 0
      }, 1500).easing(TWEEN.Easing.Elastic.EaseOut).start();
    } else {
      geometry.fold();
    }
  }
  
  /*
  function getIntersects(e) {
    // Check if the dymaxion is clicked.
    // http://mrdoob.github.com/three.js/examples/canvas_interactive_cubes.html

    var vector = new THREE.Vector3(
      e.clientX / window.innerWidth * 2 - 1,
      -(e.clientY / window.innerHeight * 2 - 1),
      0
    );
    projector.unprojectVector(vector, camera);
    var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());
    return ray.intersectObjects([mesh]);
  }
  */
  
  function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
  }

  function render() {
    if (geometry.folded) {
      mesh.rotation.x = (mesh.rotation.x + 0.01) % (Math.PI * 2);
      mesh.rotation.y = (mesh.rotation.y + 0.02) % (Math.PI * 2);
    }

    renderer.render(scene, camera);
  }

  function getCanvas() {
    var x = document.createElement('canvas');
    var xc = x.getContext('2d');
    x.width = 550;
    x.height = 260;

    // Draw texture.
    var faces = geometry.unfoldedFaces;
    for (var i = 0; i < faces.length; i++) {
      var face = faces[i];
      xc.fillStyle = 'rgb(255, 255, 255)';

      var v0 = geometry.unfoldedVertices[face[0]];
      var v1 = geometry.unfoldedVertices[face[1]];
      var v2 = geometry.unfoldedVertices[face[2]];

      xc.beginPath();
      var xy0 = getXY(v0);
      var xy1 = getXY(v1);
      var xy2 = getXY(v2);
      xc.moveTo(xy0.x, xy0.y);
      xc.lineTo(xy1.x, xy1.y);
      xc.lineTo(xy2.x, xy2.y);
      xc.closePath();
      xc.fill();
    }

    return x;
  }

  function getXY(v) {
    var a = Math.sqrt(3) / 2;
    var x = (v[0] + 2.5) * 100;
    var y = 260 - (v[1] + 1.5 * a) * 100;
    return {x: x, y: y};
  }

  function randomColor() {
    var colors = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255)
    ];
    return 'rgb(' + colors.join(',') + ')';
  }
});