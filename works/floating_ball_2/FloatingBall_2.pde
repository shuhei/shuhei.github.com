ArrayList balls = new ArrayList();
int w, h;
int unit = 20;

void setup() {
  size(800, 400);
  w = width / unit;
  h = height / unit;
  background(255);
  noStroke();
  smooth();
  colorMode(HSB);
  
  initBalls();
}

void initBalls() {
  for (int i = 0; i < w; i ++) {
    for (int j = 0; j < h; j++) {
      Ball newBall = new Ball(
        unit * 0.6 + i * unit,
        unit * 0.6 + j * unit);
      balls.add(newBall);
    }
  }
}

void draw() {
  clear();
  display();
  update();
}

void display() {
  for (int i = 0; i < balls.size(); i++)
  {
    Ball ball = (Ball) balls.get(i);
    ball.display();
  }
}

void update() {
  for (int i = 0; i < balls.size(); i++)
  {
    Ball ball = (Ball) balls.get(i);
    ball.update();
  }
}

void clear() {
  fill(255);
  rect(0, 0, width, height);
}

class Ball {
  PVector origin;
  
  PVector location;
  PVector velocity;
  PVector acceleration;
  
  Ball() {
    this(0, 0);
  }
  
  Ball(float x, float y) {
    location = new PVector(x, y);
    origin = new PVector(x, y);
    velocity = new PVector();
  }
  
  void display() {
    float magnitude = velocity.mag();
    float r = 1 + magnitude * 4.0;
    // TODO: try other colors.
    fill(100 - magnitude * 3, 200, 100 + magnitude * 10);
    // TODO: try other shapes.
    ellipse(location.x, location.y, r, r);
  }
  
  void update() {
    // escape from the mouse
    PVector mouse = new PVector(mouseX, mouseY);
    PVector direction = PVector.sub(location, mouse);
    float distance = direction.mag();
    direction.normalize();
    direction.mult(1000 / (distance * distance));
    
    // go back to the orgin
    PVector displacement = PVector.sub(origin, location);
    displacement.mult(0.05);
    
    // composite forces
    acceleration = PVector.add(direction, displacement);
    
    // integration
    velocity.add(acceleration);
    velocity.mult(0.98);  // friction
    velocity.limit(30);  // top speed
    location.add(velocity);
  }
}

