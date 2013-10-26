ArrayList nodes = new ArrayList();

int w = 100;
float unit;
float beforeMouse;

void setup() {
  colorMode(HSB);
  background(255);
  smooth();
  noStroke();
  size(800, 400);
  unit = width / (w - 1.0);
  
  for (int i = 0; i < w; i++) {
    Node node = new Node(
      unit * i,
      height * 0.5
    );
    nodes.add(node);
  }
  beforeMouse = mouseY;
}

void draw() {
  clear();
  
  fill(0);
  beginShape();
  vertex(width, height);
  vertex(0, height);
  // interaction between neighbors
  for (int i = 0; i < nodes.size() - 1; i++) {
    Node left = (Node) nodes.get(i);
    Node right = (Node) nodes.get(i + 1);
    float dy = left.y - right.y;
    left.ay -= dy * 0.01;
    right.ay += dy * 0.01;
  }
  for (int i = 0; i< nodes.size(); i++) {
    Node node = (Node) nodes.get(i);
    node.goBackToOrigin();
    node.escapeFromMouse();
    node.integral();
    vertex(node.x, node.y);
    node.initForce();
  }
  vertex(width, height);
  endShape();
  
  beforeMouse = mouseY;
}

void clear() {
  fill(255);
  rect(0, 0, width, height);
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

