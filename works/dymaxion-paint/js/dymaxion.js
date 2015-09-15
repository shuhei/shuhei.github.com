Dymaxion = function() {
  var scope = this;
  var tempScope = new THREE.Geometry();
  
  THREE.Geometry.call(this);

  // create 12 vertices of a Icosahedron
  var t = (1 + Math.sqrt(5)) / 2;
      
  this.foldedVertices = [
    [-1,  t,  0],
    [ 1,  t,  0],
    [-1, -t,  0],
    [ 1, -t,  0],  // 3
    
    [ 0, -1,  t],  // 4
    [ 0,  1,  t],
    [ 0, -1, -t],
    [ 0,  1, -t],  // 7

    [ t,  0, -1],  // 8
    [ t,  0,  1],
    [-t,  0, -1],
    [-t,  0,  1],  // 11
    
    [0.5, (t + 1) / 2.0, t / 2.0],  // 12 (1, 5)
    [-(1 + t) / 3,  (1 + t) / 3, (1 + t) / 3]  // 13 (0, 11, 5)
  ];
  
  this.foldedFaces = [
    // 5 faces around point 0
    [13, 11, 5], [13, 5, 0], [13, 0, 11],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],  // 4

    // 5 adjacent faces
    [12, 5, 9],  [1, 12, 9], // 5
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],

    // 5 faces around point 3
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],

    // 5 adjacent faces
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1]
  ];
  
  var a = Math.sqrt(3) / 2;
  this.unfoldedVertices = [
    [-2, -1.5 * a],
    [-1, -1.5 * a],
    [0, -1.5 * a],
    [1, -1.5 * a],
    [2, -1.5 * a],  // 4
    
    [-2.5, -0.5 * a],  // 5
    [-1.5, -0.5 * a],
    [-0.5, -0.5 * a],
    [0.5, -0.5 * a],
    [1.5, -0.5 * a],
    [2.5, -0.5 * a],  // 10
    
    [-2, 0.5 * a],  // 11
    [-1, 0.5 * a],
    [0, 0.5 * a],
    [1, 0.5 * a],
    [2, 0.5 * a],
    [3, 0.5 * a],  // 16
    
    [-1.5, 1.5 * a],  // 17
    [-0.5, 1.5 * a],
    [0.5, 1.5 * a],
    [1.5, 1.5 * a],
    [2.5, 1.5 * a],   // 21
    
    [-1.75, -a],  // 22 (0, 6)
    [-1, -2.5 * a / 3],  // 23 (1, 6, 7)
    [-0.5, -3.5 * a / 3],  // 24 (1, 2, 7)
    [3, -0.5 * a]   // 25 (10 + 0.5x)
  ];
  this.unfoldedFaces = [
    [23, 7, 6], [23, 6, 1], [24, 2, 7],  // 0
    [1, 6, 0],
    [3, 4, 9],
    [3, 9, 8],
    [2, 8, 7],  // 4
    
    [22, 6, 5], [10, 25, 16], // 5
    [6, 7, 12],
    [7, 8, 13],
    [8, 9, 14],
    [9, 10, 15],  // 9
    
    [18, 17, 12],  // 10
    [18, 12, 13],
    [18, 13, 19],
    [20, 14, 15],
    [21, 15, 16],  // 14
    
    [12, 11, 6],  // 15
    [13, 12, 7],
    [14, 13, 8],
    [15, 14, 9],
    [16, 15, 10]  // 19
  ];
  
  
  var i, j;
  
  for (i = 0; i < this.foldedFaces.length; i++) {
    var f = this.foldedFaces[i];
    
    for (j = 0; j < 3; j++) {
      var index = f[j];
      var fv = this.foldedVertices[index];
      v(fv[0], fv[1], fv[2]);
    }
    
    var o = 3 * i;
    
    f3(o, o + 1, o + 2, tempScope);
    
    var uf = this.unfoldedFaces[i];
    tempScope.faceVertexUvs[0].push([
      getUV(this.unfoldedVertices[uf[0]]),
      getUV(this.unfoldedVertices[uf[1]]),
      getUV(this.unfoldedVertices[uf[2]])
    ]);
  }
  
  this.folded = true;
  
  scope.faces = tempScope.faces;
  scope.faceVertexUvs = tempScope.faceVertexUvs;
  
  delete tempScope;
  delete tempFaces;
  
  this.computeCentroids();
  this.computeFaceNormals();
  this.computeVertexNormals();
  
  function v(x, y, z) {
    scope.vertices.push(new THREE.Vertex(new THREE.Vector3(x / 2, y / 2, z / 2)));
  }

  function f3(a, b, c, inscope) {
    inscope.faces.push(new THREE.Face3(a, b, c));
  }
  
  function getUV(xy) {
    var x = xy[0],
        y = xy[1],
        a = Math.sqrt(3) / 2;
    
    var uv = new THREE.UV(
      (x + 2.5) / 5.5,
      1 - ((y + 1.5 * a) / (3 * a))
    );
    return uv;
  }
};

var duration = 1500;
var easing = TWEEN.Easing.Elastic.EaseOut;

Dymaxion.prototype = new THREE.Geometry();
Dymaxion.prototype.constructor = Dymaxion;

Dymaxion.prototype.unfold = function() {
  var faces = this.faces;
  for (var i = 0; i < faces.length; i++) {
    var face = faces[i];
    var uf = this.unfoldedFaces[i];
    
    new TWEEN.Tween(this.vertices[face.a].position).to({
      x: this.unfoldedVertices[uf[0]][0],
      y: this.unfoldedVertices[uf[0]][1],
      z: 0
    }, duration).easing(easing).start();
    new TWEEN.Tween(this.vertices[face.b].position).to({
      x: this.unfoldedVertices[uf[1]][0],
      y: this.unfoldedVertices[uf[1]][1],
      z: 0
    }, duration).easing(easing).start();
    new TWEEN.Tween(this.vertices[face.c].position).to({
      x: this.unfoldedVertices[uf[2]][0],
      y: this.unfoldedVertices[uf[2]][1],
      z: 0
    }, duration).easing(easing).start();    
  }
  
  this.folded = false;
};

Dymaxion.prototype.fold = function() {
  
  var faces = this.faces;
  for (var i = 0; i < faces.length; i++) {
    var face = faces[i];
    var ff = this.foldedFaces[i];
    
    new TWEEN.Tween(this.vertices[face.a].position).to({
      x: this.foldedVertices[ff[0]][0] / 2,
      y: this.foldedVertices[ff[0]][1] / 2,
      z: this.foldedVertices[ff[0]][2] / 2
    }, duration).easing(easing).start();
    new TWEEN.Tween(this.vertices[face.b].position).to({
      x: this.foldedVertices[ff[1]][0] / 2,
      y: this.foldedVertices[ff[1]][1] / 2,
      z: this.foldedVertices[ff[1]][2] / 2
    }, duration).easing(easing).start();
    new TWEEN.Tween(this.vertices[face.c].position).to({
      x: this.foldedVertices[ff[2]][0] / 2,
      y: this.foldedVertices[ff[2]][1] / 2,
      z: this.foldedVertices[ff[2]][2] / 2
    }, duration).easing(easing).start();
  }
  
  this.folded = true;
};