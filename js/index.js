var header = document.getElementsByClassName('header')[0];
var canvas = document.createElement('canvas');
canvas.classList.add('header-background');
header.insertBefore(canvas, header.firstChild);

var w, h;

resizeCanvas();
window.addEventListener('resize', resizeCanvas, false);

var ctx = canvas.getContext('2d');
render();

function resizeCanvas() {
  canvas.width = w = header.clientWidth;
  // canvas.height = h = header.clientHeight;
  canvas.height = h = 125;
}

function render() {
  // ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillStyle = 'rgb(255, 255, 255)';
  ctx.fillRect(0, 0, w, h);

  // Draw a circle.
  // var x = Math.random() * w;
  // var y = Math.random() * h;
  // ctx.fillStyle = '#fbf52f';
  // ctx.beginPath();
  // ctx.moveTo(x, y);
  // ctx.arc(x, y, 20, 0, Math.PI * 2, false);
  // ctx.closePath();
  // ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fbf52f';

  for (var by = 0; by <= h; by += 20) {
    ctx.beginPath();
    var y = by;
    for (var x = 0; x <= w; x += 3) {
      y += (Math.random() - 0.5) * 1;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }

  requestAnimationFrame(render);
}
