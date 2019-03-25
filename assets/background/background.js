'use strict';

/**
 * Represents an RGBA color.
 */
class Color {
	/**
	 * Constructs an instance.
	 * @param  {float} red   The red value.
	 * @param  {float} green The green value.
	 * @param  {float} blue  The blue value.
	 * @param  {float} alpha The alpha value.
	 */
	constructor(red, green, blue, alpha) {
		this.red = red;
		this.green = green;
		this.blue = blue;
		this.alpha = alpha;

		this.value = `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
	}
}

/**
 * A class with some utility methods.
 */
class Utils {
	/**
	 * Clamps val to be between min and max.
	 * @param  {int} val The value to clamp.
	 * @param  {int} min The minimum range.
	 * @param  {int} max The maximum range.
	 * @return {int}     A clamped value.
	 */
	static clamp(val, min, max) {
		return Math.min(Math.max(val, min), max);
	}

	/**
	 * A modulo implementaiton that handles negative numbers correctly.
	 * @param  {float} dividend The dividend.
	 * @param  {float} divisor The divisor.
	 * @return {float}   The remainder.
	 */
	static modulo(dividend, divisor) {
		return ((dividend % divisor) + divisor) % divisor;
	}

	/**
	 * Returns an array of nice looking shades of blue.
	 * @return {string[]} An array of shades of blue.
	 */
	static get blueShades() {
		return [new Color(66, 146, 198, 1), new Color(33, 113, 181, 1), new Color(8, 81, 156, 1), new Color(8, 48, 107, 1), new Color(8, 48, 107, 1)];
	}
}

/**
 * Represents a rectangle that can be drawn.
 */
class Rectangle {
	/**
	 * Constructs an instance.
	 * @param  {float} left   The left most point of the rectangle.
	 * @param  {float} top    The top most point of the rectangle.
	 * @param  {float} right  The right most point of the rectangle.
	 * @param  {float} bottom The bottom most point of the rectangle.
	 * @param  {bool}  isWall Whether this rectangle represents a wall.
	 */
	constructor(left, top, right, bottom, isWall = false) {
		this.left = left;
		this.top = top;
		this.right = right;
		this.bottom = bottom;
		this.isWall = isWall;
	}
}

/**
 * A class that encapsulates interacting with the DOM.
 */
class DOMInterface {
	/**
	 * Gets the width of the screen.
	 * @return {float} The width of the screen.
	 */
	static get screenWidth() {
		return document.documentElement.clientWidth;
	}

	/**
	 * Gets the height of the screen.
	 * @return {float} The height of the screen.
	 */
	static get screenHeight() {
		return document.documentElement.clientHeight;
	}

	/**
	 * Queues the given function to be called near 60 times/second.
	 * @param  {Function} callback The function to call.
	 */
	static queueNextFrame(callback) {
		window.requestAnimationFrame(callback);
	}

	/**
	 * Registers the given function to be called when the window is resized.
	 * @param  {Function} callback The function to call.
	 */
	static registerResizeListener(callback) {
		window.addEventListener('resize', callback);
	}

	/**
	 * Creates rectangles from text visible on the screen.
	 * @return {Rectangle[]} An array of rectangles.
	 */
	static findTextRectangles() {
		let rectangles = [];

		// My name, with some adjustments for the chosen font.
		let nameRect = document.getElementById('name').getBoundingClientRect();
		rectangles.push(new Rectangle(
			nameRect.left + 4,
			nameRect.top + 15,
			nameRect.right,
			nameRect.bottom - 15
		));

		// Text blurb.
		rectangles.push(this.DOMRectToRecangle(document.getElementsByTagName('span')[0].getBoundingClientRect()));

		// Links.
		rectangles.push(...Array.from(document.getElementsByTagName('a'), anchor => this.DOMRectToRecangle(anchor.getBoundingClientRect())));

		return rectangles;
	}

	/**
	 * Converts a DOMRect to a Rectangle.
	 * @param {DOMRect} DOMRect The rectangle to convert.
	 */
	static DOMRectToRecangle(DOMRect) {
		return new Rectangle(DOMRect.left, DOMRect.top, DOMRect.right, DOMRect.bottom);
	}
}

/**
 * Represents info about a collision.
 */
class CollisionInfo {
	/**
	 * Constructs an instance.
	 * @param  {bool} xCollision Whether a collision in the x direction occured.
	 * @param  {bool} yCollision Whether a collision in the y direction occured.
	 */
	constructor(xCollision, yCollision) {
		this.xCollision = xCollision;
		this.yCollision = yCollision;
	}
}

/**
 * Represents a ball that moves around.
 */
class Ball {
	/**
	 * Constructs an instance.
	 * @param  {float}  width The width.
	 * @param  {float}  xPos  The x position.
	 * @param  {float}  yPos  The y position.
	 * @param  {float}  xPos  The x velocity.
	 * @param  {float}  yPos  The y velocity.
	 * @param  {Color}  color The color.
	 */
	constructor(width, xPos, yPos, xVel, yVel, color) {
		this.width = width;
		this.xPos = xPos;
		this.yPos = yPos;
		this.color = color;
		this.xVel = xVel;
		this.yVel = yVel;
		this.collides = 0;

		this.element = this.createElement(width, xPos, yPos, xVel, yVel, color);
	}

	/**
	 * Constructs an SVG for drawing the ball.
	 * @param  {float}  width The width.
	 * @param  {float}  xPos  The x position.
	 * @param  {float}  yPos  The y position.
	 * @param  {float}  xPos  The x velocity.
	 * @param  {float}  yPos  The y velocity.
	 * @param  {Color}  color The color.
	 * @return {SVG}          The created SVG.
	 */
	createElement(width, xPos, yPos, xVel, yVel, color) {
		let svgns = "http://www.w3.org/2000/svg";
		let ball = document.createElementNS(svgns, "svg");
		ball.setAttribute("width", width);
		ball.setAttribute("height", width);
		ball.setAttribute("style", `position: absolute; left: ${xPos}px; top: ${yPos}px;`);
		ball.setAttribute("viewBox", "0 0 10 10");

		let circle = document.createElementNS(svgns, "circle");
		circle.setAttribute("cx", "5");
		circle.setAttribute("cy", "5");
		circle.setAttribute("r", "5");
		circle.setAttribute("fill", color.value);
		ball.appendChild(circle);

		return ball;
	}

	/**
	 * Randomized the position of this ball.
	 */
	randomizePos() {
		this.xPos = Math.floor(Math.random() * DOMInterface.screenWidth - this.width);
		this.yPos = Math.floor(Math.random() * DOMInterface.screenHeight - this.width);
	}

	/**
	 * Moves the ball.
	 * @param  {string}  direction Which direction to movie in. Either 'x' or 'y'.
	 * @param  {Boolean} backwards Whether to move the ball backwards or not.
	 */
	move(direction, backwards = false) {
		if (direction == 'x')
			this.xPos += (backwards ? -1 : 1) * this.xVel;
		else if (direction == 'y')
			this.yPos += (backwards ? -1 : 1) * this.yVel;

		this.element.style.left = `${this.xPos}px`
		this.element.style.top = `${this.yPos}px`;
	}

	/**
	 * Checks whether this ball collides with the given ball.
	 * @param  {Ball} ball The other ball.
	 * @return {bool}      If a collision happened.
	 */
	collidesWithBall(ball) {
		return ball.collidesWithBallImpl(this);
	}

	/**
	 * Checks whether this ball collides with the given rect.
	 * @param  {Rectangle} rect The other rectangle.
	 * @return {bool}      	    If a collision happened.
	 */
	collidesWithRect(rect) {
		let collision = this.collidesWithImpl(this.ballRectCollisionTest.bind(this), rect);

		this.handleCollision(collision);

		return collision != null;
	}

	/* Private Methods */

	/**
	 * Implementation for whether this ball collides with another ball.
	 * @param  {Ball} ball The other ball.
	 * @return {bool}      Whether a collision happened or not.
	 */
	collidesWithBallImpl(ball) {
		let collision = this.collidesWithImpl(this.ballBallCollisionTest.bind(this), ball);

		this.handleCollision(collision);

		return collision != null;
	}

	/**
	 * Implementation for collision detection.
	 * @param  {Function} method   The method to call that detects collisions.
	 * @param  {Ball} element  Element to compare against for collision.
	 * @return {CollisionInfo}     The collision that happened, or null.
	 */
	collidesWithImpl(method, element) {
		let collisionX = false;
		let collisionY = false;

		// Move the ball, check if there will be a collision, then move it back.

		this.move('x');
		collisionX = method(element);
		this.move('x', true);
		this.move('y');
		collisionY = method(element);
		this.move('y', true);

		if (collisionX || collisionY) {
			return new CollisionInfo(collisionX, collisionY);
		}

		return null;
	}

	/**
	 * Handles a collision, changing the velocity of this ball as necessary.
	 * @param  {CollisionInfo} collision The collision that happened.
	 */
	handleCollision(collision) {
		if (collision == null) {
			return;
		}

		if (collision.xCollision) {
			this.xVel *= -1;
		}

		if (collision.yCollision) {
			this.yVel *= -1;
		}

		this.collides++;
	}

	/**
	 * Whether the ball collides with the given rectangle.
	 * @param  {Rectangle} rectangle The rectangle to check against.
	 * @return {bool}           	 Whether a collision is happening.
	 */
	ballRectCollisionTest(rectangle) {
		let closestX = Utils.clamp(this.xPos + (this.width / 2), rectangle.left, rectangle.right);
		let closestY = Utils.clamp(this.yPos + (this.width / 2), rectangle.top, rectangle.bottom);

		let distanceX = this.xPos + (this.width / 2) - closestX;
		let distanceY = this.yPos + (this.width / 2) - closestY;

		let distanceSquared = Math.pow(distanceX, 2) + Math.pow(distanceY, 2);
		return distanceSquared < Math.pow(this.width / 2, 2);
	}

	/**
	 * Whether the ball collides with the given ball.
	 * @param  {Ball} ball The ball to check against.
	 * @return {bool}      Whether a collision is happening.
	 */
	ballBallCollisionTest(ball) {
		return Math.hypot(this.xPos + (this.width / 2) - ball.xPos - (ball.width / 2), this.yPos + (this.width / 2) - ball.yPos - (ball.width / 2)) <= this.width / 2 + ball.width / 2;
	}
}

/**
 * Represents the background of the website, a cool display of bouncing balls.
 */
class Background {
	/**
	 * Constructs an instance.
	 * @param  {Canvas} canvas The canvas to draw on.
	 */
	constructor(container) {
		this.container = container;

		// Set up resize handling.
		this.onWindowResize();
		setTimeout(this.onWindowResize.bind(this), 100);
		DOMInterface.registerResizeListener(this.onWindowResize.bind(this));

		// Set up ball bouncing.
		this.rectangles = this.createRectangles();
		this.balls = this.createBalls();

		for(let ball of this.balls){
			container.querySelector("#balls").appendChild(ball.element);
		}
	}

	/**
	 * Advances the simulation one step, then queues itself for further simulation.
	 */
	tick() {
		this.update();

		DOMInterface.queueNextFrame(this.tick.bind(this));
	}

	/* Private Methods */

	/**
	 * Recreates the rectangles to bounce off of and adjusts the size of the canvas.
	 */
	onWindowResize() {
		this.rectangles = this.createRectangles();
		this.adjustContainerSize();
	}

	/**
	 * Adjusts the size of the canvas to match the screen.
	 */
	adjustContainerSize() {
		this.container.setAttribute('width', DOMInterface.screenWidth);
		this.container.setAttribute('height', DOMInterface.screenHeight);
	}

	/**
	 * Finds and creates all the rectangles the balls can bounce off of.
	 * @return {Rectangle[]} An array of rectangles.
	 */
	createRectangles() {
		// The visible text.
		let rectangles = DOMInterface.findTextRectangles();

		let screenWidth = DOMInterface.screenWidth;
		let screenHeight = DOMInterface.screenHeight;

		// Walls so the balls don't leave the screen.
		rectangles.push(...[
			new Rectangle(0, -10, screenWidth, 0, true),
			new Rectangle(0, screenHeight, screenWidth, screenHeight + 10, true),
			new Rectangle(-10, 0, 0, screenHeight, true),
			new Rectangle(screenWidth, 0, screenWidth + 10, screenHeight, true)
		]);

		return rectangles;
	}

	/**
	 * Creates the balls that bounce around in random positions, sizes, velocities, and colors.
	 * @return {Ball[]} An array of balls.
	 */
	createBalls() {
		let balls = [];

		let numBalls = 12;

		for (let i = 0; i < numBalls; i++) {
			balls.push(this.createRandomBall(Utils.blueShades, Math.floor(3 * Math.random() * 20) + 20));
		}

		for (let ball of balls) {
			while (this.checkForCollisions(ball, this.rectangles, balls))
				ball.randomizePos();
		}

		return balls;
	}

	/**
	 * Creates a ball of the given type with a certain width and random color from the given shades.
	 * @param  {Ball}    type   A subclass of ball.
	 * @param  {Color[]} shades An array of colors.
	 * @param  {float}   width  The width of the ball
	 * @return {ball}           The created ball.
	 */
	createRandomBall(shades, width) {
		return new Ball(
			width,
			Math.floor(Math.random() * DOMInterface.screenWidth - width),
			Math.floor(Math.random() * DOMInterface.screenHeight - width),
			(Math.floor(Math.random() * 2) * 2 - 1) * 0.5,
			(Math.floor(Math.random() * 2) * 2 - 1) * 0.5,
			shades[Math.floor(Math.random() * shades.length)]);
	}

	/**
	 * Checks for any collisions between the given ball and othe rectangles and balls.
	 * @param  {Ball}        ball       The ball to check collisions for.
	 * @param  {Rectangle[]} rectangles The rectangles to check against.
	 * @param  {Ball[]}      balls      The balls to check against.
	 * @return {bool}                   Whether a collision happened.
	 */
	checkForCollisions(ball, rectangles, balls) {
		let collisionRect = false;
		let collisionBall = false;

		// Rectangle collisions.
		for (let rectangle of rectangles) {
			if (collisionRect = ball.collidesWithRect(rectangle))
				break;
		}

		// Ball collisions.
		for (let otherBall of balls) {
			if (otherBall == ball)
				continue;

			if (collisionBall = ball.collidesWithBall(otherBall))
				break;
		}

		return collisionRect || collisionBall;
	}

	/**
	 * Updates the ball simulation by one step.
	 */
	update() {
		// Check collisions. Velocity changing is handled in the Ball class.
		for (let ball of this.balls) {
			this.checkForCollisions(ball, this.rectangles, this.balls);
		}

		// Randomize the ball to a new spot if its been colliding too much, otherwise move it one step.
		for (let ball of this.balls) {
			if (ball.collides > 10) {
				while(this.checkForCollisions(ball, this.rectangles, this.balls))
					ball.randomizePos();
				ball.collides = 0;
			} else {
				ball.move('x');
				ball.move('y');
			}
		}
	}
}