int numX = 10;
int numY = 10;
int s = 10;
Node[][] nodes;
ArrayList edges;

float k = 0.03;
float natural;

boolean dragging;
Node dragged = null;

void setup() {
  size(500, 500);
  smooth();
  fill(0);
  background(200);
  
  nodes = new Node[numY][numX];
  edges = new ArrayList();
  
  natural = width / (numX + 1);
  
  // Put nodes.
  for (int j = 0; j < numY; j++) {
    for (int i = 0; i < numX; i++) {
      Node node = new Node();
      node.x = (i + 1) * natural;
      node.y = (j + 1) * natural;
      nodes[j][i] = node;
    }
  }
  
  // Put horizontal edges.
  for (int j = 0; j < numY; j++) {
    for (int i = 0; i < numX - 1; i++) {
      Node node1 = nodes[j][i];
      Node node2 = nodes[j][i + 1];
      edges.add(new Edge(node1, node2));
    }
  }
  // Put vertical edges.
  for (int i = 0; i < numX; i++) {
    for (int j = 0; j < numY - 1; j++) {
      Node node1 = nodes[j][i];
      Node node2 = nodes[j + 1][i];
      edges.add(new Edge(node1, node2));
    }
  }
  // Put naname edges.
  for (int j = 0; j < numY - 1; j++) {
    for (int i = 0; i < numX - 1; i++) {
      Node node1 = nodes[j][i];
      Node node2 = nodes[j + 1][i + 1];
      Node node3 = nodes[j + 1][i];
      Node node4 = nodes[j][i + 1];
      edges.add(new Edge(node1, node2));
      edges.add(new Edge(node3, node4));
    }
  }
}

void draw() {
  background(200);
  
  // Physics
  for (int i = 0; i < edges.size(); i++) {
    Edge edge = (Edge) edges.get(i);
    Node node1 = edge.node1;
    Node node2 = edge.node2;
    float dst = dist(node1.x, node1.y, node2.x, node2.y);
    float ex =  dst - edge.natural;
    float dx = node2.x - node1.x;
    float dy = node2.y - node1.y;
    node1.vx += k * ex * dx / dst;
    node1.vy += k * ex * dy / dst;
    node2.vx -= k * ex * dx / dst;
    node2.vy -= k * ex * dy / dst;
  }
  for (int j = 0; j < numY; j++) {
    for (int i = 0; i < numX; i++) {
      Node node = nodes[j][i];
      if (abs(node.vx) < 0.01) node.vx = 0;
      if (abs(node.vy) < 0.01) node.vy = 0;
      if (i > 0 && i < numX - 1 && j > 0 && j < numY - 1 && node != dragged) {
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.9;
        node.vy *= 0.9;
      }
    }
  }
  
  // Draw edges.
  for (int i = 0; i < edges.size(); i++) {
    Edge edge = (Edge) edges.get(i);
    Node node1 = edge.node1;
    Node node2 = edge.node2;
    float dst = dist(node1.x, node1.y, node2.x, node2.y);
    float ex =  dst - edge.natural;
    stroke(255);
    strokeWeight(0.5);
    line(node1.x, node1.y, node2.x, node2.y);
  }
  // Draw nodes.
  for (int j = 0; j < numY; j++) {
    for (int i = 0; i < numX; i++) {
      Node node = nodes[j][i];
      noStroke();
      fill(255);
      rect(node.x - s / 2, node.y - s / 2, s, s);
    }
  }
}

void mousePressed() {
  // Check if nodes clicked.
  for (int j = 1; j < numY - 1; j++) {
    for (int i = 1; i < numX - 1; i++) {
      Node node = nodes[j][i];
      if (node.x - s / 2 <= mouseX &&
          node.x + s / 2 >= mouseX &&
          node.y - s / 2 <= mouseY &&
          node.y + s / 2 >= mouseY) {
        dragged = node;
        break;
      }
    }
    if (dragged != null) {
      break;
    }
  }
}

void mouseDragged() {
  if (dragged != null) {
    dragged.x = mouseX;
    dragged.y = mouseY;
  }
}

void mouseReleased() {
  if (dragged != null) {
    dragged.vx = 0;
    dragged.vy = 0;
    dragged = null;
  }
}
class Edge {
  Node node1, node2;
  float natural;
  
  Edge(Node node1, Node node2) {
    this.node1 = node1;
    this.node2 = node2;
    this.natural = dist(node1.x, node1.y, node2.x, node2.y);
  }
}
class Node {
  float x,y;
  float vx, vy;
  
  Node() {
    x = 0;
    y = 0;
    vx = 0;
    vy = 0;
  }
}

