ArrayList _circles;
Circle _newCircle;
PImage _img;

void setup()
{
  smooth();
  noStroke();
  background(255, 255, 255);
  
  // _img = loadImage("http://farm4.static.flickr.com/3087/2340591310_b72c0d73a0_b.jpg");
  //size(_img.width, _img.height);
  
  size(500, 333);
  _img = loadImage("flower.jpg");
  
  _circles = new ArrayList();
  addNewCircle();
}

void draw()
{
  // Draw circle.
  fill(_img.pixels[_newCircle.x + _newCircle.y * width]);
  ellipse(_newCircle.x, _newCircle.y, _newCircle.r * 2, _newCircle.r * 2);
  // Expand cirlce.
  if (doesIntersect() || (_newCircle.r > width * 0.04 && random(0, 1) < 0.03))
  {
    _circles.add(_newCircle);
    addNewCircle();
  }
  else
  {
    _newCircle.r += 1;
  }
}

// Add new circle that doesn't intersect with other circles.
void addNewCircle()
{
  int count = 0;
  while (true)
  {
    if (count > 100)
    {
      noLoop();
      save("circles.png");
      return;
    }
    else
    {
      count++;
    }
    
    _newCircle = new Circle((int)random(0, width), (int)random(0, height), 1);
    if (!doesIntersect())
    {
      break;
    }
  }
}

// Check if new circle intersects with other circles.
Boolean doesIntersect()
{
  for (int i = 0; i < _circles.size(); i++)
  {
    Circle c = (Circle)_circles.get(i);
    if (dist(_newCircle.x, _newCircle.y, c.x, c.y) <= _newCircle.r + c.r)
    {
      return true;
    }
  }
  return false;
}
class Circle
{
  int x;
  int y;
  float r;
  
  Circle(int x, int y, int r)
  {
    this.x = x;
    this.y = y;
    this.r = r;
  }
}

