let {init, Sprite, Pool, initKeys, bindKeys, keyPressed, GameLoop} = kontra;
let {canvas} = init();

canvas.width = 1200;
canvas.height = canvas.width / 16 * 9;
canvas.style = "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; border:1px solid gray";

let UNIT_MAP_WIDTH = canvas.width / 16;
let UNIT_MAP_HEIGHT = canvas.height / 9;

let BLACK = '#424242';
let WHITE = '#FFFFFF';
let GREY = '#BDBDBD';
let PLAYER_FRAME1 = 'assets/img/player1.png';
let PLAYER_FRAME2 = 'assets/img/player2.png';
let PLAYER_BACK_FRAME1 = 'assets/img/player3.png';
let PLAYER_BACK_FRAME2 = 'assets/img/player4.png';

let IS_BACK_SIDE = false;

/**
 * Levels
 */
let LEVEL_1 = [
    [
        [0, UNIT_MAP_HEIGHT * 6, UNIT_MAP_WIDTH * 10, UNIT_MAP_HEIGHT * 9],
        [UNIT_MAP_WIDTH * 10, UNIT_MAP_HEIGHT * 3, UNIT_MAP_WIDTH * 6, UNIT_MAP_HEIGHT * 9]
    ],
    [UNIT_MAP_WIDTH * 12.5, UNIT_MAP_HEIGHT * 2]
];

let LEVEL_2 = [
    [
        [0, UNIT_MAP_HEIGHT * 3, UNIT_MAP_WIDTH * 6, UNIT_MAP_HEIGHT * 9],
        [UNIT_MAP_WIDTH * 6, UNIT_MAP_HEIGHT * 6, UNIT_MAP_WIDTH * 4, UNIT_MAP_HEIGHT * 9],
        [UNIT_MAP_WIDTH * 10, UNIT_MAP_HEIGHT * 3, UNIT_MAP_WIDTH * 6, UNIT_MAP_HEIGHT * 9]
    ],
    [UNIT_MAP_WIDTH * 12.5, UNIT_MAP_HEIGHT * 2]

];

let LEVEL_3 = [
    [
        [0, UNIT_MAP_HEIGHT * 6, UNIT_MAP_WIDTH * 4, UNIT_MAP_HEIGHT * 9],
        [UNIT_MAP_WIDTH * 4, UNIT_MAP_HEIGHT * 2, UNIT_MAP_WIDTH * 3, UNIT_MAP_HEIGHT * 9],
        [UNIT_MAP_WIDTH * 7, UNIT_MAP_HEIGHT * 4, UNIT_MAP_WIDTH * 3, UNIT_MAP_HEIGHT * 9],
        [UNIT_MAP_WIDTH * 10, UNIT_MAP_HEIGHT * 9, UNIT_MAP_WIDTH * 3, UNIT_MAP_HEIGHT * 9],
        [UNIT_MAP_WIDTH * 13, UNIT_MAP_HEIGHT * 4, UNIT_MAP_WIDTH * 3, UNIT_MAP_HEIGHT * 9]
    ],
    [UNIT_MAP_WIDTH * 14, UNIT_MAP_HEIGHT * 4 + 1]
];

let LEVELS = [LEVEL_1, LEVEL_2, LEVEL_3];
let CUR_LEVEL = 0;

let goal = Sprite({
    x: UNIT_MAP_WIDTH * 12.5,
    y: UNIT_MAP_HEIGHT * 2,
    width: UNIT_MAP_HEIGHT,
    height: UNIT_MAP_HEIGHT,
    color: GREY,
    update: update_goal
});

function update_goal() {
    this.x = LEVELS[CUR_LEVEL][1][0];
    this.y = LEVELS[CUR_LEVEL][1][1];

    if (this.collidesWith(player)) {
        if (CUR_LEVEL < LEVELS.length - 1) {
            CUR_LEVEL++;
            player.x = 100;
            player.y = 0;
            tile_pool.clear();
        } else {
            alert('game over, you win')
        }
    }
}

function generate_map() {
    LEVELS[CUR_LEVEL][0].forEach(function (para) {
        get_tile(...para)
    });
}

let player = Sprite({
    x: 100,
    y: 0,
    pre_y: 0,
    width: UNIT_MAP_HEIGHT,
    height: UNIT_MAP_HEIGHT,
    color: GREY,
    dy: 0,
    ddy: 0,
    is_landed: false,
    move_right: null,
    rotation: 0,
    animCount: 0,
    walk: player_walk
});

let playerImg = new Image();
playerImg.src = PLAYER_FRAME1;
playerImg.onload = function () {
    player.image = playerImg;
};

function player_walk() {
    if (player.animCount === 30) {
        playerImg.src = IS_BACK_SIDE ? PLAYER_BACK_FRAME2 : PLAYER_FRAME2;
    }
    if (player.animCount === 60) {
        playerImg.src = IS_BACK_SIDE ? PLAYER_BACK_FRAME1 : PLAYER_FRAME1;
        player.animCount = 0;
    }
    player.animCount += 1;
}

let tile_pool = Pool({
    create: Sprite,
    maxSize: 16,
});

function get_tile(x, y, width, height) {
    tile_pool.get({
        x: x,
        y: y,
        width: width,
        height: height,
        anchor: {x: 0, y: 0},  // top left corner
        color: BLACK,
        update: update_status,
    })
}

function update_status() {
    if (!IS_BACK_SIDE) {
        this.anchor = {x: 0, y: 0};
        this.color = BLACK;
    } else {
        this.anchor = {x: 0, y: 1};
        this.color = WHITE;
    }

    if (player.collidesWith(this)) {
        if (!IS_BACK_SIDE) {
            if (player.y + player.height >= this.y && player.x + player.width >= this.x && player.x <= this.x + this.width) {
                if (player.pre_y + player.height <= this.y + 1) {
                    player.y = this.y - player.height + 1;
                    player.dy = 0;
                    player.ddy = 0;
                    player.is_landed = true;
                } else {
                    if (player.move_right) {
                        player.x = this.x - player.width;
                    } else {
                        player.x = this.x + this.width;
                    }
                }
            }
        } else {
            if (player.y - player.height <= this.y && player.x + player.width >= this.x && player.x <= this.x + this.width) {
                if (player.pre_y - player.height >= this.y) {
                    player.y = this.y + player.height;
                    player.dy = 0;
                    player.ddy = 0;
                    player.is_landed = true;
                } else {
                    if (player.move_right) {
                        player.x = this.x - player.width;
                    } else {
                        player.x = this.x + this.width;
                    }
                }
            }
        }
    } else {
        !IS_BACK_SIDE ? player.ddy = 1 : player.ddy = -1;
    }
}

function fill_canvas() {
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext('2d');
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;

    if (!IS_BACK_SIDE) {
        context.fillStyle = WHITE;
    } else {
        context.fillStyle = BLACK;
    }
    context.fillRect(0, 0, canvas.width, canvas.height);
}


/**
 * Game control
 */
initKeys();

// bindKeys('up', function () {
//     // if (player.is_landed) {
//     if (!IS_BACK_SIDE) {
//         // player.dy = -20;
//         player.dy = -15;
//         player.ddy = 1;
//         player.is_landed = false;
//     } else {
//         IS_BACK_SIDE = false;
//         player.anchor = {x: 0, y: 0};
//         player.y -= 5;
//         player.pre_y = 0;
//         console.log("player.pre_y + player.height: " + (player.pre_y + player.height) + ' player.y + player.height: ' + (player.y + player.height) + ' this.y: ' + this.y);
//
//         // log_pre_pos();
//     }
//     // }
// });
//
// bindKeys('down', function () {
//     if (IS_BACK_SIDE) {
//         player.dy = 15;
//         player.ddy = -1;
//         player.is_landed = false;
//     } else {
//         IS_BACK_SIDE = true;
//         player.anchor = {x: 0, y: 1};
//         player.y += 5;
//         player.pre_y = UNIT_MAP_HEIGHT * 9;
//         console.log("player.pre_y + player.height: " + (player.pre_y + player.height) + ' player.y + player.height: ' + (player.y + player.height) + ' this.y: ' + this.y);
//
//         // log_pre_pos();
//     }
// });

function log_pre_pos() {
    player.pre_x = player.x;
    player.pre_y = player.y;
}

/**
 * Game loop
 */
let loop = GameLoop({
    update: function () { // update the game state
        generate_map();
        goal.update();
        log_pre_pos();

        if (!IS_BACK_SIDE && player.y + player.height >= canvas.height) {
            player.x = 100;
            player.y = 0;
        }
        if (IS_BACK_SIDE && player.y - player.height < 0) {
            player.x = 100;
            player.y = UNIT_MAP_HEIGHT * 9;
        }


        if (keyPressed('up')) {
            if (player.is_landed) {
                if (!IS_BACK_SIDE) {
                    player.dy = -20;
                    player.ddy = 1;
                    player.is_landed = false;
                } else {
                    console.log("player.pre_y + player.height: " + (player.pre_y + player.height) + ' player.y + player.height: ' + (player.y + player.height) + ' this.y: ' + this.y);

                    IS_BACK_SIDE = false;
                    playerImg.src = PLAYER_FRAME1;
                    player.animCount = 0;
                    player.anchor = {x: 0, y: 0};
                    player.y -= 150;
                }
            }

        } else if (keyPressed('down')) {
            if (player.is_landed) {
                if (IS_BACK_SIDE) {
                    player.dy = 20;
                    player.ddy = -1;
                    player.is_landed = false;
                } else {
                    console.log("player.pre_y + player.height: " + (player.pre_y + player.height) + ' player.y + player.height: ' + (player.y + player.height) + ' this.y: ' + this.y);

                    IS_BACK_SIDE = true;
                    playerImg.src = PLAYER_BACK_FRAME1;
                    player.animCount = 0;
                    player.anchor = {x: 0, y: 1};
                    player.y += 150;
                }
            }
        }


        if (keyPressed('right')) {
            player.x += 5;
            player.move_right = true;
        } else if (keyPressed('left')) {
            player.x -= 5;
            player.move_right = false;
        }

        player.walk();
        player.update();
        tile_pool.update();
    },
    render: function () { // render the game state
        fill_canvas();

        tile_pool.render();
        goal.render();
        player.render();
    }
});


/**
 * Start the game
 */
loop.start();
