function extend(ChildClass, ParentClass) {
    var parent = new ParentClass();
    ChildClass.prototype = parent;
    ChildClass.prototype.super = parent.constructor;
    ChildClass.prototype.constructor = ChildClass;
}

function Asteroid(mass, x, y, x_speed, y_speed, rotation_speed) {
    var density = 1; // kg per square pixel
    var radius = Math.sqrt((mass / density) / Math.PI);
    this.super(mass, radius, x, y, 0, x_speed, y_speed, rotation_speed);
    this.circumference = 2 * Math.PI * this.radius;
    this.segments = Math.ceil(this.circumference / 15);
    this.segments = Math.min(25, Math.max(5, this.segments));
    this.noise = 0.2;
    this.shape = [];
    for (var i = 0; i < this.segments; i++) {
        this.shape.push(2 * (Math.random() - 0.5));
    }
}
extend(Asteroid, Mass);

Asteroid.prototype.draw = function (ctx, guide) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    draw_asteroid(ctx, this.radius, this.shape, {
        noise: this.noise,
        guide: guide
    });
    ctx.restore();
}


function Mass(mass, radius, x, y, angle, x_speed, y_speed, rotation_speed) {
    this.x = x;
    this.y = y;
    this.mass = mass || 1;
    this.radius = radius || 50;
    this.angle = angle || 0;
    this.x_speed = x_speed || 0;
    this.y_speed = y_speed || 0;
    this.rotation_speed = rotation_speed || 0;
}

Mass.prototype.update = function (elapsed, ctx) {
    this.x += this.x_speed * elapsed;
    this.y += this.y_speed * elapsed;
    this.angle += this.rotation_speed * elapsed;
    this.angle %= (2 * Math.PI);

    if (this.x - this.radius > ctx.canvas.width) {
        this.x = -this.radius;
    }
    if (this.x + this.radius < 0) {
        this.x = ctx.canvas.width + this.radius;
    }
    if (this.y - this.radius > ctx.canvas.height) {
        this.y = -this.radius;
    }
    if (this.y + this.radius < 0) {
        this.y = ctx.canvas.height + this.radius;
    }
}

Mass.prototype.push = function (angle, force, elapsed) {
    this.x_speed += elapsed * (Math.cos(angle) * force) / this.mass;
    this.y_speed += elapsed * (Math.sin(angle) * force) / this.mass;
}

Mass.prototype.twist = function (force, elapsed) {
    this.rotation_speed += elapsed * force / this.mass;
}

Mass.prototype.speed = function () {
    return Math.sqrt(Math.pow(this.x_speed, 2) + Math.pow(this.y_speed, 2));
}

Mass.prototype.movement_angle = function () {
    return Math.atan2(this.y_speed, this.x_speed);
}

Mass.prototype.draw = function (c) {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.angle);
    c.beginPath();
    c.arc(0, 0, this.radius, 0, 2 * Math.PI);
    c.lineTo(0, 0);
    c.strokeStyle = "#FFFFFF";
    c.stroke();
    c.restore();
}

function collision(obj1, obj2) {
    return distance_between(obj1, obj2) < (obj1.radius + obj2.radius);
}

function distance_between(obj1, obj2) {
    return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
}

function Ship(mass, radius, x, y, power, weapon_power) {
    this.super(mass, radius, x, y, 1.5 * Math.PI);
    this.thruster_power = power;
    this.steering_power = this.thruster_power / 20;
    this.thruster_on = false;
    this.right_thruster = false;
    this.left_thruster = false;
    this.retro_on = false;
    this.weapon_power = weapon_power || 500;
    this.loaded = false;
    this.weapon_reload_time = 0.25;
    this.time_until_reloaded = this.weapon_reload_time;
    this.compromised = false;
    this.max_health = 2.0;
    this.health = this.max_health;
}
extend(Ship, Mass);

Ship.prototype.draw = function (c, guide) {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.angle);
    if (guide && this.compromised) {
        c.save();
        c.fillStyle = "red";
        c.beginPath();
        c.arc(0, 0, this.radius, 0, 2 * Math.PI);
        c.fill();
        c.restore();
    }
    draw_ship(c, this.radius, {
        guide: guide,
        thruster: this.thruster_on
    });
    c.restore();
}

Ship.prototype.update = function (elapsed, c) {
    this.push(this.angle, this.thruster_on * this.thruster_power, elapsed);
    //this.twist((this.right_thruster - this.left_thruster) * this.steering_power, elapsed);

    this.rotation_speed = (this.right_thruster - this.left_thruster) * this.steering_power / 25;

    if (!this.thruster_on) {
        if (Math.abs(this.x_speed) > 0) this.x_speed = this.x_speed * 0.99;
        if (Math.abs(this.y_speed) > 0) this.y_speed = this.y_speed * 0.99;
    }

    Mass.prototype.update.apply(this, arguments);
    this.loaded = this.time_until_reloaded === 0;
    if (!this.loaded) {
        this.time_until_reloaded -= Math.min(elapsed, this.time_until_reloaded);
    }
    if (this.compromised) {
        this.health -= Math.min(elapsed, this.health)
    }
    Mass.prototype.update.apply(this, arguments)
}

function key_handler(e, value) {
    var nothing_handled = false;
    switch (e.key || e.keyCode) {
        case "ArrowUp":
        case "w":
        case 38:
        case 87:
            ship.thruster_on = value;
            break;
        case "ArrowLeft":
        case "a":
        case 37:
        case 65:
            ship.left_thruster = value;
            break;
        case "ArrowRight":
        case "d":
        case 39:
        case 68:
            ship.right_thruster = value;
            break;
        case " ":
        case 32:
            ship.trigger = value;
            break;
        case "g":
        case 71:
            if (value) guide = !guide;
        default:
            nothing_handled = true;
    }
    if (!nothing_handled) e.preventDefault();
}

function Projectile(mass, lifetime, x, y, x_speed, y_speed, rotation_speed) {
    var density = 0.001;
    var radius = Math.sqrt((mass / density) / Math.PI);
    this.super(mass, radius, x, y, 0, x_speed, y_speed, rotation_speed);
    this.lifetime = lifetime;
    this.life = 1;
}
extend(Projectile, Mass);

Projectile.prototype.update = function (elapsed, c) {
    this.life -= (elapsed / this.lifetime);
    Mass.prototype.update.apply(this, arguments);
}

Projectile.prototype.draw = function (c, guide) {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.angle);
    draw_projectile(c, this.radius, this.life, guide);
    c.restore();
}

Ship.prototype.projectile = function (elapsed) {
    var p = new Projectile(0.025, 1,
        this.x + Math.cos(this.angle) * this.radius,
        this.y + Math.sin(this.angle) * this.radius,
        this.x_speed,
        this.y_speed,
        this.rotation_speed
    );
    p.push(this.angle, this.weapon_power, elapsed);
    this.push(this.angle + Math.PI, this.weapon_power, elapsed);
    this.time_until_reloaded = this.weapon_reload_time
    return p;
}

function Indicator(label, x, y, width, height) {
    this.label = label + ": ";
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Indicator.prototype.draw = function (c, max, level) {
    c.save();
    c.strokeStyle = "white";
    c.fillStyle = "white";
    c.font = this.height + "pt Arial";
    var offset = c.measureText(this.labe).width;
    c.fillText(this.label, this.x, this.y + this.height - 1);
    c.beginPath();
    c.rect(offset + this.x, this.y, this.width, this.height);
    c.stroke();
    c.beginPath();
    c.rect(offset + this.x, this.y, this.width * (max / level), this.height);
    c.fill();
    c.restore();
}

function NumberIndicator(label, x, y, options) {
    options = options || {}
    this.label = label + ": ";
    this.x = x;
    this.y = y;
    this.digits = options.digits || 0;
    this.pt = options.pt || 10;
    this.align = options.align || 'end';
}

NumberIndicator.prototype.draw = function (c, value) {
    c.save();
    c.fillStyle = "white";
    c.font = this.pt + "pt Arial";
    c.textAlign = this.align;
    c.fillText(
        this.label + value.toFixed(this.digits),
        this.x, this.y + this.pt - 1
    );
    c.restore();
}

function Message(x, y, options) {
    options = options || {};
    this.x = x;
    this.y = y;
    this.main_pt = options.main_pt || 28;
    this.sub_pt = options.sub_pt || 18;
    this.fill = options.fill || "white";
    this.textAlign = options.align || 'center';
}

Message.prototype.draw = function (c, main, sub) {
    c.save();
    c.fillStyle = this.fill;
    c.textAlign = this.textAlign;
    c.font = this.main_pt + "pt Arial";
    c.fillText(main, this.x, this.y);
    c.font = this.sub_pt + "pt Arial";
    c.fillText(sub, this.x, this.y + this.main_pt);
    c.restore();
}