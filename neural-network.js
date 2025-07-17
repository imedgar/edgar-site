let neuralNodes = [];
let neuralConnections = [];
const NODES_TOTAL = 50;
const MAX_DISTANCE = 140;
const CONNECTION_OPACITY = 0.4;

// Initialize neural network background
window.addEventListener('load', () => {
  new p5((sketch) => {
    sketch.setup = function () {
      let canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
      canvas.parent("neural-network");

      // Create nodes
      for (let i = 0; i < NODES_TOTAL; i++) {
        neuralNodes.push(new NeuralNode(sketch));
      }
    };

    sketch.draw = function () {
      sketch.background(26, 26, 26);

      updateNeuralConnections(sketch);
      renderNeuralConnections(sketch);
      renderNeuralNodes(sketch);
    };

    sketch.windowResized = function () {
      sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);

      // Reposition nodes that might be off-screen
      for (let node of neuralNodes) {
        if (node.x > sketch.windowWidth) node.x = sketch.windowWidth - 50;
        if (node.y > sketch.windowHeight) node.y = sketch.windowHeight - 50;
      }
    };
  });
});

function updateNeuralConnections(sketch) {
  neuralConnections = [];

  for (let i = 0; i < neuralNodes.length; i++) {
    for (let j = i + 1; j < neuralNodes.length; j++) {
      let distance = sketch.dist(neuralNodes[i].x, neuralNodes[i].y, neuralNodes[j].x, neuralNodes[j].y);

      if (distance < MAX_DISTANCE) {
        let opacity = sketch.map(distance, 0, MAX_DISTANCE, CONNECTION_OPACITY, 0);
        neuralConnections.push({
          from: neuralNodes[i],
          to: neuralNodes[j],
          opacity: opacity,
          distance: distance
        });
      }
    }
  }
}

function renderNeuralConnections(sketch) {
  for (let connection of neuralConnections) {
    sketch.stroke(180, 180, 190, connection.opacity * 255);
    sketch.strokeWeight(0.6);
    sketch.line(connection.from.x, connection.from.y, connection.to.x, connection.to.y);
  }
}

function renderNeuralNodes(sketch) {
  for (let node of neuralNodes) {
    node.update(sketch);
    node.render(sketch);
  }
}

function NeuralNode(sketch) {
  this.x = sketch.random(sketch.windowWidth);
  this.y = sketch.random(sketch.windowHeight);
  this.vx = sketch.random(-0.3, 0.3);
  this.vy = sketch.random(-0.3, 0.3);
  this.size = sketch.random(1, 3);
  this.pulseSpeed = sketch.random(0.005, 0.015);
  this.pulseOffset = sketch.random(sketch.TWO_PI);
  this.connectionCount = 0;

  this.update = function (sketch) {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if (this.x < 0 || this.x > sketch.windowWidth) this.vx *= -1;
    if (this.y < 0 || this.y > sketch.windowHeight) this.vy *= -1;

    // Keep within bounds
    this.x = sketch.constrain(this.x, 0, sketch.windowWidth);
    this.y = sketch.constrain(this.y, 0, sketch.windowHeight);

    // Count connections for this frame
    this.connectionCount = 0;
    for (let other of neuralNodes) {
      if (other !== this && sketch.dist(this.x, this.y, other.x, other.y) < MAX_DISTANCE) {
        this.connectionCount++;
      }
    }
  };

  this.render = function (sketch) {
    sketch.push();

    // Pulse effect
    let pulse = sketch.sin(sketch.frameCount * this.pulseSpeed + this.pulseOffset) * 0.5 + 0.5;
    let currentSize = this.size + pulse * 2;

    // Color based on connection count
    let intensity = sketch.map(this.connectionCount, 0, 6, 120, 220);

    // Outer glow
    sketch.fill(180, 180, 190, 40);
    sketch.noStroke();
    sketch.ellipse(this.x, this.y, currentSize * 2.5, currentSize * 2.5);

    // Main node
    sketch.fill(200, 200, 210, intensity);
    sketch.ellipse(this.x, this.y, currentSize, currentSize);

    sketch.pop();
  };
}
