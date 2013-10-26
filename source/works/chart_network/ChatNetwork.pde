HashMap nodeMap;
HashMap edgeMap;
ArrayList nodes;
ArrayList edges;

int edgeThreshold = 10;
int nodeThreshold = 30;

float naturalLength = 100;
float k = 0.01;

boolean dragging;
Node dragged = null;

int maxEdge = 0;

PFont font;

void setup() {
  size(500, 500);
  smooth();
  fill(0);
  font = createFont("HelveticaNeue-12", 12);
  textFont(font);
  
  
  nodeMap = new HashMap();
  edgeMap = new HashMap();
  
  try {
    String[] lines = loadStrings("chat.csv");
    for (int i = 0; i < lines.length; i++) {
      String[] fields = lines[i].split(";");
      String name1 = "";
      String name2 = "";
      for (int col = 0; col < fields.length; col++) {
        String token = fields[col];
        if (col == 2) {
          name1 = token;
        } else if (col == 3) {
          name2 = token;
        }
      }
      
      if (nodeMap.containsKey(name1)) {
        // Increment the node's count.
        ((Node)nodeMap.get(name1)).count ++;
      } else {
        // Create node if it doesn't exist.
        Node node = new Node(name1);
        node.x = random(10, width - 20);
        node.y = random(10, height - 10);
        nodeMap.put(name1, node);
      }
      if (nodeMap.containsKey(name2)) {
        ((Node)nodeMap.get(name2)).count ++;
      } else {
        Node node = new Node(name2);
        node.x = random(10, width - 20);
        node.y = random(10, height - 10);
        nodeMap.put(name2, node);
      }
      
      // Edge
      if (name1.equals(name2)) {
        continue;
      }
      String edgeKey;
      // Regards name1=>name2 and name2=>name1 connections as same.
      if (name1 > name2) {
        edgeKey = name1 + ";" + name2;
      } else {
        edgeKey = name2 + ";" + name1;
      }
      if (edgeMap.containsKey(edgeKey)) {
        ((Edge)edgeMap.get(edgeKey)).count ++;
      } else {
        Node node1 = (Node) nodeMap.get(name1);
        Node node2 = (Node) nodeMap.get(name2);
        edgeMap.put(edgeKey, new Edge(node1, node2));
      }
    }
    println("nodes: " + nodeMap.size());
    println("edges: " + edgeMap.size());
  } catch (Exception e) {
    println(e);
  }
  nodes = valuesArray(nodeMap);
  edges = valuesArray(edgeMap);
  
  for (int i = edges.size() - 1; i >= 0; i --) {
    Edge edge = (Edge) edges.get(i);
    if (edge.count < edgeThreshold) {
      edges.remove(i);
      //continue;
    } else {
      edge.node1.visibility = true;
      edge.node2.visibility = true;
    }
    if (edge.count > maxEdge) {
      maxEdge = edge.count;
    }
  }
  for (int i = nodes.size() - 1; i >= 0; i--) {
    Node node = (Node) nodes.get(i);
    if (!node.visibility) {
      nodes.remove(i);
    }
  }
  
  circleLayout();
  println("kaname".hashCode());
  println("T".hashCode());
}

void circleLayout() {
  Collections.sort(nodes, new Comparator() {
    public int compare(Object obj1, Object obj2) {
      Node node1 = (Node) obj1;
      Node node2 = (Node) obj2;
      return node1.name < node2.name;
      /*
      if (node1.count < node2.count) {
        return -1;
      } else if (node1.count == node2.count) {
        return 0;
      } else {
        return 1;
      }
      */
    }
  });
  for (int i = 0; i < nodes.size(); i ++) {
    Node node = (Node) nodes.get(i);
    node.x = width * 0.48 + cos(2 * PI * i / nodes.size()) * width * 0.42;
    node.y = height * 0.50 + sin(2 * PI * i / nodes.size()) * height * 0.42;
  }
}

void draw() {
  colorMode(RGB);
  background(200, 200, 150);
    
  // Physics
  // Edges' spring.
  /*
  for (int i = 0; i < edges.size(); i++) {
    Edge edge = (Edge) edges.get(i);
    Node node1 = edge.node1;
    Node node2 = edge.node2;
    float dst = dist(node1.x, node1.y, node2.x, node2.y);
    float dx = node2.x - node1.x;
    float dy = node2.y - node1.y;
    float f = (dst - naturalLength) * k;
    node1.vx += f * dx / dst;
    node1.vy += f * dy / dst;
    node2.vx -= f * dx / dst;
    node2.vy -= f * dy / dst;
  }
  // Relax.
  for (int i = 0; i < nodes.size() - 1; i++) {
    for (int j = i + 1; j < nodes.size(); j++) {
      Node node1 = (Node) nodes.get(i);
      Node node2 = (Node) nodes.get(j);
      // float dst = dist(node1.x, node1.y, node2.x, node2.y);
      float dx = node2.x - node1.x;
      float dy = node2.y - node1.y;
      //float g = 100;
      float lensq = dx * dx + dy * dy;
      float ax = 0;
      float ay = 0;
      if (lensq == 0) {
        ax = random(1);
        ay = random(1);
      } else if (lensq < 300 * 300) {
        ax = 50 * dx / lensq;
        ay = 50 * dy / lensq;
      }
      node1.vx -= ax;
      node1.vy -= ay;
      node2.vx += ax;
      node2.vy += ay;
    }
  }
  */
  
  // Draw edges.
  for (int i = 0; i < edges.size(); i++) {
    Edge edge = (Edge) edges.get(i);
    if (!edge.isDragged) {
      edge.render();
    }
  }
  if (dragged != null) {
    for (int i = 0; i < edges.size(); i++) {
      Edge edge = (Edge) edges.get(i);
      if (edge.isDragged) {
        edge.render();
      }
    }
  }
  // Draw nodes.
  for (int i = 0; i < nodes.size(); i++) {
    Node node = (Node) nodes.get(i);
    node.update();
    node.render();
  }
  for (int i = 0; i < nodes.size(); i++) {
    Node node = (Node) nodes.get(i);
    node.renderText();
  }
  
}

void mousePressed() {
  // Check if nodes clicked.
  for (int i = 0; i < nodes.size(); i++) {
    Node node = (Node) nodes.get(i);
    float s = node.getSize();
    if (node.x - s / 2 - 3 <= mouseX &&
        node.x + s / 2 + 3 >= mouseX &&
        node.y - s / 2 - 3 <= mouseY &&
        node.y + s / 2 + 3 >= mouseY) {
      dragged = node;
      for (int j = 0; j < edges.size(); j++) {
        Edge edge = (Edge) edges.get(j);
        if (node == edge.node1 || node == edge.node2) {
          edge.isDragged = true;
        }
      }
      break;
    }
  }
}

void mouseDragged() {
  if (dragged != null) {
    dragged.x = mouseX;
    dragged.y = mouseY;
    dragged.vx = 0;
    dragged.vy = 0;
  }
}

void mouseReleased() {
  dragged = null;
  for (int i = 0; i < edges.size(); i ++) {
    Edge edge = (Edge) edges.get(i);
    if (edge.isDragged) {
      edge.isDragged = false;
    }
  }
}

ArrayList valuesArray(HashMap map) {
  Collection values = map.values();
  ArrayList result = new ArrayList();
  for (Object value : values) {
    result.add(value);
  }
  return result;
}
class Edge {
  Node node1, node2;
  int count;
  boolean isDragged;
  
  Edge(Node node1, Node node2) {
    this.node1 = node1;
    this.node2 = node2;
    count = 1;
    isDragged = false;
  }
  
  void render() {
    if (isDragged) {
      colorMode(HSB);
      stroke(5, 180, 255, 100 + 80 * count / maxEdge);
      //stroke(50, 255);
    } else {
      stroke(255, 100 + 80 * count / maxEdge);
    }
    // strokeWeight(count * 300 / (node1.count + node2.count));
    strokeWeight(40 * count / maxEdge);
    // strokeWeight(50 * ((float)count / node1.count + (float)count / node2.count));
    line(node1.x, node1.y, node2.x, node2.y);
  }
}
class Node {
  float x,y;
  float vx, vy;
  int count;
  String name;
  boolean visibility;
  
  Node(String name) {
    x = 0;
    y = 0;
    vx = 0;
    vy = 0;
    count = 1;
    visibility = false;
    this.name = name;
  }
  
  void update() {
    if (abs(vx) < 0.01) vx = 0;
    if (abs(vy) < 0.01) vy = 0;
    if (this != dragged) {
      x += vx;
      y += vy;
      vx *= 0.9;
      vy *= 0.9; 
    }
  }
  
  void render() {
      colorMode(HSB);
      fill(20 + abs(name.hashCode()) % 50, 240, 255);
      strokeWeight(3);
      stroke(255);
      ellipse(x, y, getSize(), getSize());
  }
  
  void renderText() {
    colorMode(RGB);
    fill(0);
    textAlign(LEFT, CENTER);
    text(name, x + getSize() / 2 + 5, y - 1);
  }
  
  float getSize() {
    return count / 55 + 4;
  }
}

