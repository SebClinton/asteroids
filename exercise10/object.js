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

Asteroid.prototype.update = function (elapsed) {
    if (this.x - this.radius + elapsed * this.x_speed > context.canvas.width) {
        this.x = -this.radius;
    }
    if (this.x + this.radius + elapsed * this.x_speed < 0) {
        this.x = context.canvas.width + this.radius;
    }
    if (this.y - this.radius + elapsed * this.y_speed > context.canvas.height) {
        this.y = -this.radius;
    }
    if (this.y - this.radius + elapsed * this.y_speed < 0) {
        this.y = context.canvas.height + this.radius;
    }
    this.x += elapsed * this.x_speed;
    this.y += elapsed * this.y_speed;
    this.angle = (this.angle + this.rotation_speed * elapsed) %
        (2 * Math.PI);
}

Asteroid.prototype.draw = function (ctx, guide) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    draw_asteroid(ctx, this.radius, this.shape, {
        guide: guide,
        noise: this.noise
    });
    ctx.restore();
}

function Pacman(x, y, radius, speed) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.angle = 0;
    this.x_speed = speed;
    this.y_speed = 0;
    this.time = 0;
    this.mouth = 0;
}

Pacman.prototype.draw = function (ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    draw_pacman(ctx, this.radius, this.mouth);
    ctx.restore();
}

Pacman.prototype.turn = function (direction) {
    if (this.y_speed) {
        this.x_speed = -direction * this.y_speed;
        this.y_speed = 0;
        this.angle = this.x_speed > 0 ? 0 : Math.PI;
    } else {
        this.y_speed = direction * this.x_speed
        this.x_speed = 0;
        this.angle = this.y_speed > 0 ? 0.5 * Math.PI : 1.5 * Math.PI;
    }
}

Pacman.prototype.turn_left = function () {
    this.turn(-1);
}
Pacman.prototype.turn_right = function () {
    this.turn(1);
}

Pacman.prototype.update = function (elapsed, width, height) {

    if (this.x - this.radius + elapsed * this.x_speed > width) {
        this.x = -this.radius;
    }
    if (this.x + this.radius + elapsed * this.x_speed < 0) {
        this.x = width + this.radius;
    }
    if (this.y - this.radius + elapsed * this.y_speed > height) {
        this.y = -this.radius;
    }
    if (this.y + this.radius + elapsed * this.y_speed < 0) {
        this.y = height + this.radius;
    }
    this.x += this.x_speed * elapsed;
    this.y += this.y_speed * elapsed;
    this.time += elapsed;
    this.mouth = Math.abs(Math.sin(2 * Math.PI * this.time));
}

Pacman.prototype.move_right = function () {
    this.x_speed = this.speed;
    this.y_speed = 0;
    this.angle = 0;
}
Pacman.prototype.move_down = function () {
    this.x_speed = 0;
    this.y_speed = this.speed;
    this.angle = 0.5 * Math.PI;
}
Pacman.prototype.move_left = function () {
    this.x_speed = -this.speed;
    this.y_speed = 0;
    this.angle = Math.PI
}
Pacman.prototype.move_up = function () {
    this.x_speed = 0;
    this.y_speed = -this.speed;
    this.angle = 1.5 * Math.PI;
}

window.onkeydown = function (e) {
    let key = e.key || e.keycode;
    switch (key) {
        case "ArrowLeft":
        case 37:
            pacman.move_left();
            break;
        case "ArrowUp":
        case 38:
            pacman.move_up();
            break;
        case "ArrowRight":
        case 39:
            pacman.move_right();
            break;
        case "ArrowDown":
        case 40:
            pacman.move_down();
            break;
    }
}

function keydown_handler(e) {
    let key = e.key || e.keyCode;
    let nothing_handled = false;
    switch (key) {
        case "ArrowLeft":
        case 37:
            pacman.move_left();
            break;
        case "ArrowUp":
        case 38:
            pacman.move_up();
            break;
        case "ArrowRight":
        case 39:
            pacman.move_right();
            break;
        case "ArrowDown":
        case 40:
            pacman.move_down();
            break;
        default:
            nothing_handled = true
    }
    if (!nothing_handled) e.preventDefault();
}

function Ghost(x, y, radius, speed, colour) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.colour = colour;
}

Ghost.prototype.draw = function (ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    draw_ghost(ctx, this.radius, {
        fill: this.colour
    });
    ctx.restore();
}

Ghost.prototype.update = function (target, elapsed) {
    var angle = Math.atan2(target.y - this.y, target.x - this.x);
    var x_speed = Math.cos(angle) * this.speed;
    var y_speed = Math.sin(angle) * this.speed;
    this.x += x_speed * elapsed;
    this.y += y_speed * elapsed;
}