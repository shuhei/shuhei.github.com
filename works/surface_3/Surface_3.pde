int w = 101;
float unit;
float beforeMouse;

Node[] nodes = new Node[w];
Edge[] edges = new Edge[w - 1];

void setup() {
  colorMode(HSB);
  background(255);
  smooth();
  noStroke();
  size(800, 400);
  unit = width / (w - 1.0);
  
  for (int i = 0; i < w; i++) {
    Node node = new Node(unit * i, height * 0.5);
    nodes[i] = node;
  }
  for (int i = 0; i < nodes.length - 1; i++) {
    Node left = nodes[i];
    Node right = nodes[i + 1];
    Edge edge = new Edge(left, right);
    edges[i] = edge;
  }
  
  beforeMouse = mouseY;
}

void draw() {
  clear();
  
  // interaction between neighbors
  for (int i = 0; i < edges.length; i++) {
    Edge edge = edges[i];
    edge.interact();
  }
  for (int i = 0; i < nodes.length; i++) {
    Node node = nodes[i];
    node.goBackToOrigin();
    node.escapeFromMouse();
    node.integral();
  }
  for (int i = 0; i < edges.length; i++) {
    Edge edge = edges[i];
    edge.display();
  }
  for (int i = 0; i < nodes.length; i++) {
    Node node = nodes[i];
    node.initForce();
  }
  
  beforeMouse = mouseY;
}

void clear() {
  fill(255);
  rect(0, 0, width, height);
}
class Edge {
  Node left;
  Node right;
  
  Edge(Node left, Node right) {
    this.left = left;
    this.right = right;
  }
  
  void interact() {
    float dy = left.y - right.y;
    left.ay -= dy * 0.01;
    right.ay += dy * 0.01;
  }
  
  void display() {
    float velocity = abs(left.vy + right.vy) / 60;
    //fill(250, lerp(0, 0, velocity), lerp(0, 255, velocity));
    fill(0, lerp(50, 255, velocity), lerp(255, 230, velocity));
    beginShape();
    vertex(left.x, height);
    vertex(left.x, left.y);
    vertex(right.x, right.y);
    vertex(right.x, height);
    endShape();
    
    noFill();
    stroke(50);
    line(left.x, left.y, right.x, right.y);
    noStroke();
  }
}
class Node {
  float x;
  float oy = 0;
  float y, vy, ay;
  float topSpeed = 30;
  
  Node(float x, float y) {
    this.x = x;
    this.y = oy = y;
    vy = random(-1.0, 1.0);
  }
  
  void initForce() {
    ay = 0;
  }
  
  void goBackToOrigin() {
    ay += (oy - y) * 0.005;
  }
  
  void escapeFromMouse() {
    float dx = mouseX - x;
    float minMouse = min(beforeMouse, mouseY);
    float maxMouse = max(beforeMouse, mouseY);
    if (abs(dx) <= 120 && (minMouse <= y && y <= maxMouse)) {
      float mouseAcc = mouseY - beforeMouse;
      ay += 0.7 * mouseAcc * norm(abs(dx), 120, 0);
    }
  }
  
  void integral() {
    vy += ay;
    vy *= 0.95;
    if (abs(vy) > topSpeed) {
      vy = topSpeed * vy / abs(vy);
    }
    y += vy;
  }
}

