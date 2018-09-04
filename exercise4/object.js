


function Asteroid(segments, radius, noise) {
    this.x = context.canvas.width * Math.random();
    this.y = context.canvas.height * Math.random();
    this.angle = 0;
    this.x_speed = context.canvas.width * (Math.random() - 0.5);
    this.y_speed = context.canvas.height * (Math.random() - 0.5);
    this.rotation_speed = 2 * Math.PI * (Math.random() - 0.5);
    this.radius = radius;
    this.noise = noise;
    this.shape = [];
    for (var i = 0; i < segments; i++) {
        this.shape.push(Math.random() - 0.5);
    }
}

