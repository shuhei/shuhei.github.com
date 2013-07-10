(function() {
  var Bvh, Node, Parser, Perfume, SoundPlayer,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Uint8Array.prototype.max = function() {
    var item, max, _i, _len;
    max = this[0];
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      item = this[_i];
      if (item > max) max = item;
    }
    return max;
  };

  Uint8Array.prototype.sum = function() {
    var item, sum, _i, _len;
    sum = 0;
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      item = this[_i];
      sum += item;
    }
    return sum;
  };

  Uint8Array.prototype.average = function() {
    return this.sum() / this.length;
  };

  Node = (function() {

    function Node(name, parent) {
      this.name = name;
      this.parent = parent;
      this.children = [];
      this.channels = [];
      this.initialOffset = new THREE.Vector3;
      this.translation = new THREE.Vector3;
      this.rotation = new THREE.Vector3;
      this.matrix = new THREE.Matrix4;
      this.globalMatrix = new THREE.Matrix4;
    }

    Node.prototype.isRoot = function() {
      return !this.parent;
    };

    Node.prototype.isSite = function() {
      return this.children.length === 0;
    };

    Node.prototype.update = function(index, frame) {
      var channel, child, v, _i, _j, _len, _len2, _ref, _ref2;
      this.translation.set(0, 0, 0);
      this.rotation.set(0, 0, 0);
      _ref = this.channels;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        channel = _ref[_i];
        v = frame[index];
        switch (channel) {
          case "Xposition":
            this.translation.x = v;
            break;
          case "Yposition":
            this.translation.y = v;
            break;
          case "Zposition":
            this.translation.z = v;
            break;
          case "Xrotation":
            this.rotation.x = v * Math.PI / 180;
            break;
          case "Yrotation":
            this.rotation.y = v * Math.PI / 180;
            break;
          case "Zrotation":
            this.rotation.z = v * Math.PI / 180;
        }
        index++;
      }
      this.translation.addSelf(this.initialOffset);
      this.matrix.identity();
      this.matrix.translate(this.translation);
      this.matrix.setRotationFromEuler(this.rotation, 'YXZ');
      this.globalMatrix.copy(this.matrix);
      if (this.parent) this.globalMatrix.multiplySelf(this.parent.globalMatrix);
      _ref2 = this.children;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        child = _ref2[_j];
        index = child.update(index, frame);
      }
      return index;
    };

    Node.prototype.cout = function(indent) {
      var child, _i, _len, _ref, _results;
      if (indent == null) indent = "";
      console.log(indent + this.name + " " + this.channels.length + " channels " + "(" + this.initialOffset.x + ", " + this.initialOffset.x + ", " + this.initialOffset.z + ")");
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(child.cout("  " + indent));
      }
      return _results;
    };

    return Node;

  })();

  Bvh = (function() {

    function Bvh(root) {
      this.root = root;
      this.frames = [];
      this.joints = [];
    }

    Bvh.prototype.update = function(pos) {
      var frame;
      if (pos >= 0 && pos < this.frames.length) {
        frame = this.frames[pos];
        return this.root.update(0, frame);
      }
    };

    return Bvh;

  })();

  Parser = (function() {

    function Parser(data) {
      this.data = data;
    }

    Parser.prototype.parse = function() {
      var bvh, done, field, fields, frame, frameCount, i, joint, line, lines, ox, oy, oz, _i, _j, _len, _len2, _ref;
      lines = this.data.split("\n");
      i = 0;
      bvh = null;
      joint = null;
      done = false;
      while (line = lines[i++]) {
        line = line.replace(/^\s+|\s+$/, "");
        fields = line.split(" ");
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
            ox = parseFloat(fields[1]);
            oy = parseFloat(fields[2]);
            oz = parseFloat(fields[3]);
            joint.initialOffset.set(ox, oy, oz);
            break;
          case "CHANNELS":
            if (fields.length > 2) {
              _ref = fields.slice(2);
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                field = _ref[_i];
                joint.channels.push(field);
              }
            }
            break;
          case "}":
            joint = joint.parent;
            if (!joint) done = true;
        }
        if (done) break;
      }
      frameCount = 0;
      while (line = lines[i++]) {
        fields = line.split(" ");
        if (fields[0] === "Frames:") {
          frameCount = parseInt(fields[1]);
        } else if (fields[0] === "Frame") {
          bvh.frameTime = parseFloat(fields[2]);
          break;
        }
      }
      console.log("Frame count: " + frameCount + ", frame time: " + bvh.frameTime + ", total time: " + frameCount * bvh.frameTime);
      while (line = lines[i++]) {
        fields = line.split(" ");
        frame = [];
        if (fields.length > 0) {
          for (_j = 0, _len2 = fields.length; _j < _len2; _j++) {
            field = fields[_j];
            frame.push(parseFloat(field));
          }
          bvh.frames.push(frame);
        }
      }
      if (frameCount !== bvh.frames.length) {
        throw "Invalid frames! frame count: " + frameCount + ", bvh: " + bvh.frames.length;
      }
      return bvh;
    };

    return Parser;

  })();

  SoundPlayer = (function() {

    function SoundPlayer(file) {
      this.file = file;
    }

    SoundPlayer.prototype.init = function(callback) {
      var xhr,
        _this = this;
      this.context = new (window.WindowAudioContext || window.webkitAudioContext);
      xhr = new XMLHttpRequest;
      xhr.open('GET', this.file, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function() {
        return _this.context.decodeAudioData(xhr.response, function(buffer) {
          _this.buffer = buffer;
          return callback();
        }, function() {
          return console.log("Failed to load sounds.");
        });
      };
      return xhr.send();
    };

    SoundPlayer.prototype.play = function() {
      this.source = this.context.createBufferSource();
      this.source.buffer = this.buffer;
      this.analyser = this.context.createAnalyser();
      this.source.connect(this.analyser);
      this.analyser.connect(this.context.destination);
      return this.source.noteOn(0);
    };

    SoundPlayer.prototype.isReady = function() {
      return !!this.source;
    };

    SoundPlayer.prototype.fft = function() {
      var freqByteData;
      freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(freqByteData);
      return freqByteData;
    };

    SoundPlayer.prototype.volume = function() {
      return this.fft().average();
    };

    return SoundPlayer;

  })();

  Perfume = (function() {

    function Perfume() {
      this.onMouseMove = __bind(this.onMouseMove, this);
      this.animate = __bind(this.animate, this);
      this.onResize = __bind(this.onResize, this);      this.objects = [];
      this.radius = 300;
      this.theta = 0;
      this.mouseX = 0;
      this.mouseY = 0;
      this.bvhs = [];
      this.prevPos = 1000000000;
    }

    Perfume.prototype.start = function() {
      this.startTime = new Date().getTime();
      return this.animate();
    };

    Perfume.prototype.addBvh = function(bvh) {
      this.bvhs.push(bvh);
      bvh.objects = [];
      return this.addNode(bvh.root, this.scene, bvh.objects);
    };

    Perfume.prototype.createLine = function(x1, y1, z1, x2, y2, z2, color) {
      var geo, line, mat;
      mat = new THREE.LineBasicMaterial({
        color: color || 0x999999,
        opacity: 1.0,
        linewidth: 1,
        blending: THREE.AdditiveBlending
      });
      geo = new THREE.Geometry;
      geo.vertices.push(new THREE.Vertex(new THREE.Vector3(x1, y1, z1)));
      geo.vertices.push(new THREE.Vertex(new THREE.Vector3(x2, y2, z2)));
      line = new THREE.Line(geo, mat);
      return line;
    };

    Perfume.prototype.init = function() {
      var angle, color, i, light, line, num;
      this.container = document.createElement('div');
      document.body.appendChild(this.container);
      this.scene = new THREE.Scene;
      this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
      this.camera.position.set(0, 300, 500);
      this.scene.add(this.camera);
      num = 256;
      this.grounds = [];
      for (i = 0; 0 <= num ? i < num : i > num; 0 <= num ? i++ : i--) {
        angle = i * Math.PI * 2 / num + Math.PI;
        color = new THREE.Color().setHSV(i / num, 1, 0.8).getHex();
        line = this.createLine(0, 0, 0, 100 * Math.cos(angle), 0, 100 * Math.sin(angle), color);
        this.scene.add(line);
        this.grounds.push(line);
      }
      light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(1, 1, 1).normalize();
      this.scene.add(light);
      light = new THREE.DirectionalLight(0xffffff);
      light.position.set(-1, -1, -1).normalize();
      this.scene.add(light);
      this.projector = new THREE.Projector;
      this.renderer = new THREE.WebGLRenderer;
      this.renderer.sortObjects = false;
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.container.appendChild(this.renderer.domElement);
      this.stats = new Stats;
      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.top = '0px';
      this.container.appendChild(this.stats.domElement);
      return window.addEventListener('resize', this.onResize);
    };

    Perfume.prototype.onResize = function(e) {
      var h, w;
      w = window.innerWidth;
      h = window.innerHeight;
      this.renderer.setSize(w, h);
      this.camera.aspect = w / h;
      return this.camera.updateProjectionMatrix();
    };

    Perfume.prototype.addNode = function(joint, parentNode, objects) {
      var child, color, geo, geometry, line, mat, material, object, _i, _len, _ref, _results;
      color = null;
      if (joint.isRoot()) {
        color = 0xff0000;
      } else if (joint.isSite()) {
        color = 0xffff00;
      } else {
        color = 0xffffff;
      }
      geometry = new THREE.CubeGeometry(5, 5, 5);
      material = new THREE.MeshLambertMaterial({
        color: color
      });
      object = new THREE.Mesh(geometry, material);
      object.eulerOrder = 'YXZ';
      parentNode.add(object);
      objects.push(object);
      _ref = joint.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        this.addNode(child, object, objects);
        mat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          opacity: 1.0,
          linewidth: 1,
          blending: THREE.AdditiveBlending
        });
        geo = new THREE.Geometry;
        geo.vertices.push(new THREE.Vertex(new THREE.Vector3));
        geo.vertices.push(new THREE.Vertex(child.initialOffset));
        line = new THREE.Line(geo, mat);
        _results.push(object.add(line));
      }
      return _results;
    };

    Perfume.prototype.animate = function() {
      var bvh, dt, fft, frameCount, frameTime, i, joint, object, pos, vol, _i, _len, _len2, _ref, _ref2;
      window.requestAnimationFrame(this.animate);
      dt = new Date().getTime() - this.startTime;
      frameCount = this.bvhs[0].frames.length;
      frameTime = this.bvhs[0].frameTime;
      pos = Math.floor(dt / 1000.0 / frameTime) % frameCount;
      if (pos < this.prevPos) this.audio.play();
      this.prevPos = pos;
      fft = this.audio.fft();
      for (i = 0; i < 256; i++) {
        vol = Math.pow(fft[i] / 255, 2) * 5;
        this.grounds[i].scale.set(vol, 1, vol);
      }
      _ref = this.bvhs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        bvh = _ref[_i];
        bvh.update(pos);
        _ref2 = bvh.joints;
        for (i = 0, _len2 = _ref2.length; i < _len2; i++) {
          joint = _ref2[i];
          object = bvh.objects[i];
          object.position.copy(joint.translation);
          object.rotation.copy(joint.rotation);
        }
      }
      this.render();
      return this.stats.update();
    };

    Perfume.prototype.render = function() {
      var $window;
      $window = $(window);
      this.camera.position.x = this.radius * Math.sin(Math.PI * 2 * this.mouseX / $window.width());
      this.camera.position.y = this.radius * Math.cos(Math.PI / 2 * this.mouseY / $window.height());
      this.camera.position.z = this.radius * Math.cos(Math.PI * 2 * this.mouseX / $window.width());
      this.camera.lookAt(this.scene.position);
      return this.renderer.render(this.scene, this.camera);
    };

    Perfume.prototype.onMouseMove = function(e) {
      this.mouseX = e.pageX;
      return this.mouseY = e.pageY;
    };

    return Perfume;

  })();

  jQuery(function($) {
    var loadBvh, loaded, perfume, resourceLoaded, soundPlayer;
    perfume = new Perfume;
    perfume.init();
    $(document).mousemove(perfume.onMouseMove);
    loaded = 0;
    resourceLoaded = function() {
      loaded++;
      if (loaded === 4) return perfume.start();
    };
    loadBvh = function(path) {
      return $.get(path, function(data) {
        var bvh, parser;
        parser = new Parser(data);
        bvh = parser.parse();
        bvh.update();
        bvh.root.cout();
        perfume.addBvh(bvh);
        return resourceLoaded();
      });
    };
    loadBvh("../data/bvhfiles/aachan.bvh");
    loadBvh("../data/bvhfiles/kashiyuka.bvh");
    loadBvh("../data/bvhfiles/nocchi.bvh");
    soundPlayer = new SoundPlayer("../data/Perfume_globalsite_sound.wav");
    perfume.audio = soundPlayer;
    return soundPlayer.init(resourceLoaded);
  });

}).call(this);
