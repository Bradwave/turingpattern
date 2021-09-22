let cellsRingPlot1 = new p5((sketch) => {

    let grid, nextGrid;
    const gridSize = 100;
    let cellSize;

    let isPlaying = false;
    let torusWrap = true;
    const deltaTime = 1;
    const numOfLoops = 50;

    const noiseFactor = 0.3;

    const mu = 1; // 1
    const nu = .5; // .5
    const feed = .055; // .055
    const kill = .062; // .062

    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = './assets/rhino.jpg';

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    var myImageData = ctx.createImageData(width, height);

    img.onload = function () {
        ctx.drawImage(img, 0, 0);
    };

    var original = function () {
        ctx.drawImage(img, 0, 0);
    };

    sketch.setup = function () {
        const parentDiv = document.getElementById("canvas-1");
        cellSize = Math.floor(parentDiv.offsetWidth * .5 / gridSize);

        sketch.createCanvas(cellSize * gridSize, cellSize * gridSize);
        sketch.pixelDensity(1);


        initGrid();

        sketch.noLoop();
        sketch.noSmooth();

        drawGrid();
    }

    sketch.draw = function () {
        if (isPlaying) {
            updateGrid();
            drawGrid();
        }
    }

    function initGrid() {
        grid = [];
        nextGrid = [];
        for (var i = 0; i < gridSize; i++) {
            grid[i] = [];
            nextGrid[i] = [];
            for (var j = 0; j < gridSize; j++) {
                grid[i][j] = {
                    x: 1 - Math.random() * noiseFactor,
                    y: Math.random() * noiseFactor
                };
            }
        }

        for (var i = Math.round(gridSize * 0.45); i < Math.round(gridSize * .55); i++) {
            for (var j = Math.round(gridSize * 0.45); j < Math.round(gridSize * 0.55); j++) {
                grid[i][j].y = 1 - Math.random() * noiseFactor;
            }
        }
    }

    function updateGrid() {
        const margin = torusWrap ? 0 : 1;
        for (let loopIndex = 0; loopIndex < numOfLoops; loopIndex++) {
            for (let i = margin; i < gridSize - margin; i++) {
                for (let j = margin; j < gridSize - margin; j++) {
                    const x = grid[i][j].x;
                    const y = grid[i][j].y;
                    const laplacian = calcLaplacian(i, j);
                    nextGrid[i][j] = {
                        x: constrain(x + (mu * laplacian.x - x * y * y + feed * (1 - x)) * deltaTime, 0, 1),
                        y: constrain(y + (nu * laplacian.y + x * y * y - (kill + feed) * y) * deltaTime, 0, 1)
                    };
                }
            }
            [grid, nextGrid] = [nextGrid, grid];
        }
    }

    function constrain(value, lowerLimit, upperLimit) {
        return value > upperLimit ? upperLimit : (value < lowerLimit ? lowerLimit : value);
    }

    function calcLaplacian(i, j) {
        const nextI = (i + 1) % grid.length;
        const nextJ = (j + 1) % grid[0].length;
        const prevI = (grid.length + i - 1) % grid.length;
        const prevJ = (grid[0].length + j - 1) % grid[0].length;

        const x = - grid[i][j].x
            + .2 * (grid[nextI][j].x + grid[prevI][j].x + grid[i][nextJ].x + grid[i][prevJ].x)
            + .05 * (grid[nextI][nextJ].x + grid[nextI][prevJ].x + grid[prevI][nextJ].x + grid[prevI][prevJ].x);
        const y = - grid[i][j].y
            + .2 * (grid[nextI][j].y + grid[prevI][j].y + grid[i][nextJ].y + grid[i][prevJ].y)
            + .05 * (grid[nextI][nextJ].y + grid[nextI][prevJ].y + grid[prevI][nextJ].y + grid[prevI][prevJ].y);
        return { x: x, y: y };
    }

    function drawGrid() {
        sketch.loadPixels();

        for (let i = 0; i < gridSize * cellSize; i++) {
            for (let j = 0; j < gridSize * cellSize; j++) {
                const pixelIndex = (i + j * gridSize * cellSize) * 4;

                const x = grid[Math.floor(i / cellSize)][Math.floor(j / cellSize)].x;
                const y = grid[Math.floor(i / cellSize)][Math.floor(j / cellSize)].y;
                let c = Math.floor((x - y) * 255);
                c = constrain(c, 0, 255);

                sketch.pixels[pixelIndex + 0] = c;
                sketch.pixels[pixelIndex + 1] = c;
                sketch.pixels[pixelIndex + 2] = c;
                sketch.pixels[pixelIndex + 3] = 240;
            }
        }

        sketch.updatePixels();
    }

    document.addEventListener('keydown', (e) => {
        if (e.code == "KeyN") {
            updateGrid();
            drawGrid();
        } else if (e.code == "KeyC") {
            isPlaying = !isPlaying;
            if (sketch.isLooping()) {
                sketch.noLoop();
            } else {
                sketch.loop();
            }
        }
    });

}, "canvas-1");