let {init, Sprite, Pool, initKeys, bindKeys, keyPressed, GameLoop} = kontra;
let {canvas} = init();

canvas.width = 1200;
canvas.height = canvas.width / 16 * 9;
canvas.style = "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; border:1px solid gray";

UNIT_MAP_WIDTH = canvas.width / 16;
UNIT_MAP_HEIGHT = canvas.height / 9;

BLACK = '#424242';
WHITE = '#FFFFFF';
GREY = '#BDBDBD';

let IS_BACK_MODE = false;

function fill_canvas() {
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext('2d');
    if (!IS_BACK_MODE) {
        context.fillStyle = WHITE;
    } else {
        context.fillStyle = BLACK;
    }
    context.fillRect(0, 0, canvas.width, canvas.height);
}

let player = Sprite({
    x: 100,
    y: 0,
    pre_x: 0,
    pre_y: 0,
    width: UNIT_MAP_HEIGHT * 1,
    height: UNIT_MAP_HEIGHT * 1,
    color: GREY,
    dy: 0,
    ddy: 0,
    is_landed: false,
    move_right: null
});

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
        // anchor: IS_BACK_MODE ? {x: 0, y: 1} : {x: 0, y: 0},  // top left corner
        anchor: {x: 0, y: 0},  // top left corner
        // color: IS_BACK_MODE ? WHITE : BLACK,
        color: BLACK,
        // color: '#123456',
        update: update_status,
        // check_collision: update_status
    })
}

// function update_tile() {
//     if (!IS_BACK_MODE) {
//         this.anchor = {x: 0, y: 0};
//         this.color = BLACK;
//     } else {
//         this.anchor = {x: 0, y: 1};
//         this.color = WHITE;
//     }
// }

function update_status() {
    if (!IS_BACK_MODE) {
        this.anchor = {x: 0, y: 0};
        this.color = BLACK;
    } else {
        this.anchor = {x: 0, y: 1};
        this.color = WHITE;
    }

    if (player.collidesWith(this)) {
        if (!IS_BACK_MODE) {
            if (player.y + player.height >= this.y && player.x + player.width >= this.x && player.x <= this.x + this.width) {
                // console.log("player.pre_y + player.height: " + (player.pre_y + player.height) + ' player.y + player.height: ' + (player.y + player.height) + ' this.y: ' + this.y);
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
                console.log("player.pre_y + player.height: " + (player.pre_y + player.height) + ' player.y + player.height: ' + (player.y + player.height) + ' this.y: ' + this.y);

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
        !IS_BACK_MODE ? player.ddy = 1 : player.ddy = -1;
    }
}

/**
 * Levels
 */
let level_1 = [
    [0, UNIT_MAP_HEIGHT * 6, UNIT_MAP_WIDTH * 10, UNIT_MAP_HEIGHT * 9],
    [UNIT_MAP_WIDTH * 10, UNIT_MAP_HEIGHT * 3, UNIT_MAP_WIDTH * 6, UNIT_MAP_HEIGHT * 9]
];

let level_2 = [
    [0, UNIT_MAP_HEIGHT * 3, UNIT_MAP_WIDTH * 6, UNIT_MAP_HEIGHT * 9],
    [UNIT_MAP_WIDTH * 6, UNIT_MAP_HEIGHT * 6, UNIT_MAP_WIDTH * 4, UNIT_MAP_HEIGHT * 9],
    [UNIT_MAP_WIDTH * 10, UNIT_MAP_HEIGHT * 3, UNIT_MAP_WIDTH * 6, UNIT_MAP_HEIGHT * 9]
];

let level_3 = [
    [0, UNIT_MAP_HEIGHT * 6, UNIT_MAP_WIDTH * 4, UNIT_MAP_HEIGHT * 9],
    [UNIT_MAP_WIDTH * 4, UNIT_MAP_HEIGHT * 2, UNIT_MAP_WIDTH * 3, UNIT_MAP_HEIGHT * 9],
    [UNIT_MAP_WIDTH * 7, UNIT_MAP_HEIGHT * 4, UNIT_MAP_WIDTH * 3, UNIT_MAP_HEIGHT * 9],
    [UNIT_MAP_WIDTH * 10, UNIT_MAP_HEIGHT * 9, UNIT_MAP_WIDTH * 3, UNIT_MAP_HEIGHT * 9],
    [UNIT_MAP_WIDTH * 13, UNIT_MAP_HEIGHT * 4, UNIT_MAP_WIDTH * 3, UNIT_MAP_HEIGHT * 9]
];

function generate_map() {
    // level_1.forEach(function (para) {
    //     get_tile(...para)
    // });

    // level_2.forEach(function (para) {
    //     get_tile(...para)
    // });

    level_3.forEach(function (para) {
        get_tile(...para)
    });
}


/**
 * Game control
 */
initKeys();

bindKeys('up', function () {
    // if (player.is_landed) {
    if (!IS_BACK_MODE) {
        // player.dy = -20;
        player.dy = -15;
        player.ddy = 1;
        player.is_landed = false;
    } else {
        IS_BACK_MODE = false;
        player.anchor = {x: 0, y: 0};
        player.y -= 5;
        log_pre_pos();
    }
    // }
});

bindKeys('down', function () {
    if (IS_BACK_MODE) {
        player.dy = 15;
        player.ddy = -1;
        player.is_landed = false;
    } else {
        IS_BACK_MODE = true;
        player.anchor = {x: 0, y: 1};
        player.y += 5;
        log_pre_pos();
    }
});

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

        log_pre_pos();

        if (!IS_BACK_MODE && player.y + player.height >= canvas.height) {
            player.x = 100;
            player.y = 0;
            player.dy = 0;
        }


        if (keyPressed('right')) {
            player.x += 5;
            player.move_right = true;
        } else if (keyPressed('left')) {
            player.x -= 5;
            player.move_right = false;
        }

        player.update();
        tile_pool.update();


        // if (keyPressed('up')) {
        //     if (!IS_BACK_MODE) {
        //         // player.dy = -20;
        //         player.dy = -15;
        //         player.ddy = 1;
        //         player.is_landed = false;
        //     } else {
        //         IS_BACK_MODE = false;
        //         player.anchor = {x: 0, y: 0};
        //         player.y -= 5;
        //         log_pre_pos();
        //     }
        // } else if (keyPressed('down')) {
        //     if (IS_BACK_MODE) {
        //         player.dy = 15;
        //         player.ddy = -1;
        //         player.is_landed = false;
        //     } else {
        //         IS_BACK_MODE = true;
        //         player.anchor = {x: 0, y: 1};
        //         player.y += 5;
        //         log_pre_pos();
        //     }
        // }

    },
    render: function () { // render the game state
        fill_canvas();

        tile_pool.render();
        player.render();
    }
});


/**
 * Start the game
 */
loop.start();
