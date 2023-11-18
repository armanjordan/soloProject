title = "Flying Fish";

description = `
  [Hold] to Dive
  [Release] to Swim Up
`;

characters = [
`
  
y yyy
 yyyly
 yyyyy
y yyy

`,
`
 llll
llllll 
llllll
 llll
`,
`
  lll
 lllll
llllll
  ll
`,
`
  ll
llll
`,
`
 l l l
 l l l
l l l
l l l
 l l l
llllll
`,
`
l l l
l l l
 l l l
 l l l
l l l
llllll
`
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1,
};

const G = {
	WIDTH: 100,
	HEIGHT: 150,
  MIN_Y_BUBBLESPEED: 0.05,
  MAX_Y_BUBBLESPEED: 0.2,
  MAX_X_BUBBLESPEED: 1,
  WATER_HEIGHT: 50,
  BUBBLE_HORIZONTAL_SPEED: 0.1,
  GRAVITY: 0.01,
  VERTICAL_FISH_SCALAR: 0.005,
}

/**
* @typedef { object } Bubble - A decorative floating object in the background
* @property { Vector } pos - The current position of the object
* @property { number } ySpeed - The vertical floating speed of this object
* @property { number } xSpeed - The horizontal floating speed of this object
*/

/**
* @type  { Bubble [] }
*/
let bubbles;


/**
* @typedef { object } Player - The Player Character
* @property { Vector } pos - The current position of the object
* @property { number } yVelocity - The current y velocity of the player
*/

/**
* @type { Player }
*/
let player;


let horizontalVelocity = 0;
let verticalLevel = 0;

let haystack = [];
let clouds = [];
let kelps = [];
let walls = [];

function update() {
  if (!ticks) {
    bubbles = times(50, () => {
      // Random number generator function
      // rnd( min, max )
      const posX = rnd(0, G.WIDTH);
      const posY = G.HEIGHT;
      // An object of type Star with appropriate properties
      return {
        // Creates a Vector
          pos: vec(posX, posY),
          // More RNG
          ySpeed: rnd(G.MIN_Y_BUBBLESPEED, G.MAX_Y_BUBBLESPEED),
          xSpeed: 0
      };
    });

    player = {
      pos: vec(G.WIDTH * 0.2, G.WATER_HEIGHT),
      yVelocity: 0
    };

    // char("a", player);
  }

  // diving
  if (input.isPressed) {
    player.yVelocity += G.VERTICAL_FISH_SCALAR
  }

  // gravity for below the water
  if (!input.isPressed && (player.pos.y >= G.WATER_HEIGHT)) {
    player.yVelocity -= G.GRAVITY
  } else {
    // gravity for above the water
    if (player.pos.y <= G.WATER_HEIGHT) {
      player.yVelocity += G.GRAVITY
    }
  }

  player.pos = vec(player.pos.x, player.pos.y + player.yVelocity)

  
  // DRAWING ----------------

  // draw ocean
  color("cyan");
  rect(0, 100, 100, -G.WATER_HEIGHT)

  // draw sky
  color("light_blue");
  rect(0, 50, 100, -50)

  // draw clouds
  spawnClouds()
  moveClouds()

  // draw player
  color("black");
  char("a", player.pos);

  // update for bubbles
  bubbles.forEach((b) => {
    // Move the star downwards
    b.pos.y -= b.ySpeed;
    b.pos.x += 1/5 * sin(b.pos.y)
    b.pos.x -= G.BUBBLE_HORIZONTAL_SPEED
    // Bring the star back to top once it's past the bottom of the screen
    b.pos.wrap(0, G.WIDTH, G.WATER_HEIGHT + 1, G.HEIGHT);

    // Choose a color to draw  
    color("light_blue");
    // Draw the star as a square of size 1
    box(b.pos, 1);
  });

  // draw floor
  color("light_yellow");
  rect(0, 100, 100, -5)

  // draw kelp
  spawnKelp();
  moveKelp();

  // draw walls
  spawnWalls();
  moveWalls();

  color("black");

  // Collisions ----------

  // Check for touching ground
  if (char("a", player.pos).isColliding.rect.light_yellow) {
    player.yVelocity = -0.3;
    play("hit");
    color("yellow");
    particle(
      player.pos.x, // x coordinate
      player.pos.y, // y coordinate
      4, // The number of particles
      1, // The speed of the particles
      -PI/2, // The emitting angle
      PI/4  // The emitting width
    );
  }

  // Check for touching wall
  if (char("a", player.pos).isColliding.rect.red) {
    play("explosion");
    bubbles = times(50, () => {
      // Random number generator function
      // rnd( min, max )
      const posX = rnd(0, G.WIDTH);
      const posY = G.HEIGHT;
      // An object of type Star with appropriate properties
      return {
        // Creates a Vector
          pos: vec(posX, posY),
          // More RNG
          ySpeed: rnd(G.MIN_Y_BUBBLESPEED, G.MAX_Y_BUBBLESPEED),
          xSpeed: 0
      };
    });

    player = {
      pos: vec(G.WIDTH * 0.2, G.WATER_HEIGHT),
      yVelocity: 0
    };

    walls = [];

    ticks = 0;

    end();
  }

  // update score
  if (ticks % 10 == 0) {
    score++;
  }
}

function spawnClouds() {
  if (ticks % 150 == 0) {
    const cloud = {
      pos: vec(100, rnd(0, 25)),
      movementX: -0.28,
      movementY: 0,
      shape: rndi(0, 3),
    };
    clouds.push(cloud);
  }
}

function spawnKelp() {
  if (ticks % 110 == 0) {
    const kelp = {
      pos: vec(100, rnd(92, 98)),
      movementX: -0.28,
      movementY: 0,
    };
    kelps.push(kelp);
  }
}

function spawnWalls() {
  if (ticks % 320 == 0 && ticks > 320) {
    const wall = {
      pos: vec(100, rnd(20, 85)),
      movementX: -0.28,
      movementY: 0,
    };
    console.log(wall.pos.y)
    walls.push(wall);
  }
}

function moveClouds() {
  clouds.forEach((l) => {
    // if (l.pos.x < 0) clouds.splice(clouds.indexOf(l), 1);
    l.pos.x += l.movementX; 
    color("white");
    if (l.shape == 0) {
      char("b", l.pos)
    }
    if (l.shape == 1) {
      char("c", l.pos)
    }
    if (l.shape == 2) {
      char("d", l.pos)
    }
  });
}

function moveKelp() {
  kelps.forEach((l) => {
    // if (l.pos.x < 0) clouds.splice(clouds.indexOf(l), 1);
    l.pos.x += l.movementX; 
    color("green");
    if (Math.round(ticks / 15) % 2 == 0) {
      char("e", l.pos)
    } else {
      char("f", l.pos)
    }
  });
}

function moveWalls() {
  walls.forEach((l) => {
    // if (l.pos.x < 0) clouds.splice(clouds.indexOf(l), 1);
    l.pos.x += l.movementX; 
    color("red");
    if (l.pos.y < 50) {
      rect(l.pos.x, 95, 2, l.pos.y - 100)
    } else {
      rect(l.pos.x, 10, 2, l.pos.y)
    }
  });
}

