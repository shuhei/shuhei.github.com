// Utilities
var __bind = function(fn, me) {
  return function() {
    return fn.apply(me, arguments);
  };
};

Uint8Array.prototype.max = function() {
  var max = this[0];
  for (var i = 0; i < this.length; i++) {
    if (this[i] > max) {
      max = this[i];
    }
  }
  return max;
};

Uint8Array.prototype.sum = function() {
  var sum = 0;
  for (var i = 0; i < this.length; i++) {
    sum += this[i];
  }
  return sum;
};

Uint8Array.prototype.average = function() {
  return this.sum() / this.length;
};

var Node = (function() {
  function Node(name, parent) {
    this.name = name;
    this.parent = parent;
    this.children = [];
    this.channels = [];
    this.initialOffset = new THREE.Vector3();
    this.translation = new THREE.Vector3();
    this.rotation = new THREE.Euler();
    this.matrix = new THREE.Matrix4();
    this.globalMatrix = new THREE.Matrix4();
  }
  
  Node.prototype.isRoot = function() {
    return !this.parent;
  };
  
  Node.prototype.isSite = function() {
    return this.children.length === 0;
  };
  
  Node.prototype.update = function(index, frame) {
    this.translation.set(0, 0, 0);
    this.rotation.set(0, 0, 0, 'YXZ');
    for (var i = 0; i < this.channels.length; i++) {
      var channel = this.channels[i],
          v = frame[index];
      if (channel === "Xposition") {
        this.translation.x = v;
      } else if (channel === "Yposition") {
        this.translation.y = v;
      } else if (channel === "Zposition") {
        this.translation.z = v;
      } else if (channel === "Xrotation") {
        this.rotation.x = v * Math.PI / 180;
      } else if (channel === "Yrotation") {
        this.rotation.y = v * Math.PI / 180;
      } else if (channel === "Zrotation") {
        this.rotation.z = v * Math.PI / 180;
      }
      index++;
    }
    
    this.translation.add(this.initialOffset);
    
    this.matrix.identity();
    this.matrix.makeTranslation(this.translation);
    this.matrix.makeRotationFromEuler(this.rotation);
    
    this.globalMatrix.copy(this.matrix);
    if (!!this.parent) {
      this.globalMatrix.multiply(this.parent.globalMatrix);
    }
    
    for (var i = 0; i < this.children.length; i++) {
      index = this.children[i].update(index, frame);
    }

    return index;
  };
  
  Node.prototype.cout = function(indent) {
    if (!indent) {
      indent = "";
    }
    console.log(indent + this.name + " " +
      this.channels.length + " channels " +
      "(" + this.initialOffset.x + ", " + this.initialOffset.x + ", " + this.initialOffset.z + ")"
    );
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].cout("  " + indent);
    }
  };

  return Node;
})();

var Bvh = (function() {
  function Bvh(root) {
    this.root = root;
    this.frames = [];
    this.joints = [];
  }
  
  Bvh.prototype.update = function(pos) {
    if (pos >= 0 && pos < this.frames.length) {
      var frame = this.frames[pos];
      this.root.update(0, frame);
    }
  };
  
  return Bvh;
})();

var Parser = (function() {
  function Parser(data) {
    this.data = data;
  }
  Parser.prototype.parse = function() {
    var lines = this.data.split("\n"),
        i = 0,
        bvh,
        joint,
        done = false;
    while (line = lines[i++]) {
      line = line.replace(/^\s+|\s+$/, "");
      var fields = line.split(" ");
      switch (fields[0]) {
        case "ROOT":
          joint = new Node(fields[1]);
          bvh = new Bvh(joint);
          bvh.joints.push(joint);
          break;
        case "JOINT":
        case "End":
          joint = new Node(fields[1], joint);
          joint.parent.children.push(joint);
          bvh.joints.push(joint);
          break;
        case "OFFSET":
          var ox = parseFloat(fields[1]),
              oy = parseFloat(fields[2]),
              oz = parseFloat(fields[3]);
          joint.initialOffset.set(ox, oy, oz);
          break;
        case "CHANNELS":
          if (fields.length > 2) {
            for (var j = 2; j < fields.length; j++) {
              var field = fields[j];
              joint.channels.push(field);
            }
          }
          break;
        case "}":
          joint = joint.parent;
          if (!joint) {
            done = true;
          }
          break;
      }
      if (done) {
        break;
      }
    }
    
    var frameCount;
    while (line = lines[i++]) {
      var fields = line.split(" ");
      if (fields[0] === "Frames:") {
        frameCount = parseInt(fields[1]);
      } else if (fields[0] === "Frame") {
        bvh.frameTime = parseFloat(fields[2]);
        break;
      }
    }
    console.log("Frame count: " + frameCount + ", frame time: " + bvh.frameTime + ", total time: " + frameCount * bvh.frameTime);

    while (line = lines[i++]) {
      var fields = line.split(" "),
          frame = [];
      if (fields.length > 0) {
        for (var j = 0; j < fields.length; j++) {
          frame.push(parseFloat(fields[j]));
        }
        bvh.frames.push(frame);
      }
    }

    if (frameCount !== bvh.frames.length) {
      throw "Invalid frames!";
    }

    return bvh;
  };
  return Parser;
})();

var SoundPlayer = (function() {
  function SoundPlayer(file) {
    this.file = file;
  }
  
  SoundPlayer.prototype.init = function(callback) {
    this.context = new (window.WindowAudioContext || window.webkitAudioContext)();
    
    var self = this,
        xhr = new XMLHttpRequest();
    xhr.open('GET', this.file, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      self.context.decodeAudioData(xhr.response, function(buffer) {
        self.buffer = buffer;
        callback();
      }, function() {
        console.log("Failed to load sounds.");
      });
    };
    xhr.send();    
  };
  
  SoundPlayer.prototype.play = function() {
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.analyser = this.context.createAnalyser();
    this.source.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    
    this.source.noteOn(0);
  };
  
  SoundPlayer.prototype.isReady = function() {
    return !!this.source;
  };
  
  SoundPlayer.prototype.fft = function() {
    var freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(freqByteData);
    return freqByteData;
  };

  SoundPlayer.prototype.volume = function() {
    return this.fft().average();
  };
  
  return SoundPlayer;
})();

var Perfume = (function() {
  function Perfume() {
    this.objects = [];
    this.radius = 300;
    this.theta = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.bvhs = [];
    this.prevPos = 1000000000;
  }
  
  Perfume.prototype.start = function() {
    this.startTime = new Date().getTime();
    this.animate();
  };

  Perfume.prototype.addBvh = function(bvh) {
    this.bvhs.push(bvh);
    bvh.objects = [];
    this.addNode(bvh.root, this.scene, bvh.objects);
  };
  
  Perfume.prototype.createLine = function(x1, y1, z1, x2, y2, z2, color) {
    var mat = new THREE.LineBasicMaterial({
      color: color || 0x999999,
      opacity: 1.0,
      linewidth: 1,
      blending: THREE.AdditiveBlending
    });
    var geo = new THREE.Geometry();
    geo.vertices.push(new THREE.Vector3(x1, y1, z1));
    geo.vertices.push(new THREE.Vector3(x2, y2, z2));
    var line = new THREE.Line(geo, mat);
    return line;
  }
  
  Perfume.prototype.init = function() {
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    
    this.scene = new THREE.Scene();
    
    // Add camera
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.set(0, 300, 500);
    this.scene.add(this.camera);
    
    // Add grounds
    var num = 256;
    this.grounds = [];
    for (var i = 0; i < num; i++) {
      var angle = i * Math.PI * 2 / num + Math.PI,
          color = new THREE.Color().setHSL(i / 255, 1, 0.8).getHex(),
          r = 300,
          x = r * Math.cos(angle),
          z = r * Math.sin(angle),
          line = this.createLine(x, 0, z, x, 30, z, color);
      this.scene.add(line);
      this.grounds.push(line);
    }
    
    // Add lights
    var light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(-1, -1, -1).normalize();
    this.scene.add( light );

    this.projector = new THREE.Projector();

    // Add renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.sortObjects = false;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    // Add stats
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.container.appendChild(this.stats.domElement);
    
    window.addEventListener('resize', __bind(this.onResize, this));
  };

  Perfume.prototype.onResize = function(e) {
    var w = window.innerWidth,
        h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };
  
  Perfume.prototype.addNode = function(joint, parentNode, objects) {
    var color;
    if (joint.isRoot()) {
      color = 0xff0000;
    } else if (joint.isSite()) {
      color = 0xffff00;
    } else {
      color = 0xffffff;
    }
    var geometry = new THREE.CubeGeometry(5, 5, 5),
        material = new THREE.MeshLambertMaterial({ color: color }),
        object = new THREE.Mesh(geometry, material);
    object.rotation.order = 'YXZ';
    
    parentNode.add(object);
    objects.push(object);

    for (var i = 0; i < joint.children.length; i++) {
      var child = joint.children[i];
      this.addNode(child, object, objects);
      
      var mat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 1.0,
        linewidth: 1,
        blending: THREE.AdditiveBlending
      });
      var geo = new THREE.Geometry();
      geo.vertices.push(new THREE.Vector3());
      geo.vertices.push(child.initialOffset);
      var line = new THREE.Line(geo, mat);
      object.add(line);
    }
  };
  
  Perfume.prototype.animate = function() {
    window.requestAnimationFrame(__bind(this.animate, this));

    var dt = new Date().getTime() - this.startTime,
        frameCount = this.bvhs[0].frames.length,
        frameTime = this.bvhs[0].frameTime,
        pos = Math.floor(dt / 1000.0 / frameTime) % frameCount;
    
    if (pos < this.prevPos) {
      this.audio.play();
    }
    this.prevPos = pos;

    var fft = this.audio.fft();
    for (var i = 0; i < 256; i++) {
      var vol = Math.pow(fft[i] / 255, 2) * 5;
      this.grounds[i].scale.set(1, vol, 1);
    }

    for (var i = 0; i < this.bvhs.length; i++) {
      var bvh = this.bvhs[i];
      bvh.update(pos);
      
      for (var j = 0; j < bvh.joints.length; j++) {
        var object = bvh.objects[j];
        var joint = bvh.joints[j];
        
        object.position.copy(joint.translation);
        object.rotation.copy(joint.rotation);
      }
    }
    
    this.render();
    this.stats.update();
  };

  Perfume.prototype.render = function() {
    var $window = $(window);
    this.camera.position.x = this.radius * Math.sin(Math.PI * 2 * this.mouseX / $window.width());
    this.camera.position.y = this.radius * Math.cos(Math.PI / 2 * this.mouseY / $window.height());
    this.camera.position.z = this.radius * Math.cos(Math.PI * 2 * this.mouseX / $window.width());

    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  };

  Perfume.prototype.onMouseMove = function(e) {
    this.mouseX = e.pageX;
    this.mouseY = e.pageY;
  };

  return Perfume;
})();

jQuery(function($) {
  var perfume = new Perfume();
  perfume.init();
  
  $(document).mousemove(__bind(perfume.onMouseMove, perfume));

  var loaded = 0;
  function resourceLoaded() {
  	loaded++;
  	if (loaded === 4) {
      perfume.start();
    }
  }
  
  function loadBvh(path) {
    $.get(path, function(data) {
      var parser = new Parser(data);
      bvh = parser.parse();
      bvh.update();
      bvh.root.cout();
      
      perfume.addBvh(bvh);
      
      resourceLoaded();
    });
  }
  loadBvh("../data/bvhfiles/aachan.bvh");
  loadBvh("../data/bvhfiles/kashiyuka.bvh");
  loadBvh("../data/bvhfiles/nocchi.bvh");
  
  var soundPlayer = new SoundPlayer("../data/Perfume_globalsite_sound.wav");
  perfume.audio = soundPlayer;
  soundPlayer.init(resourceLoaded);
});
