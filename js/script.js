let fileData = null;

function downloadImage() {
    let file = document.querySelector('input[type=file]').files[0];
    let preview = document.getElementById("preview");
    let reader = new FileReader();

    reader.onloadend = function() {
        preview.src = fileData = reader.result;
    };

    reader.onerror = function() {
        console.log(reader.error);
    };

    if (file) {
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
    }
    preview.style.border = "border: black 1px solid";
    preview.style.borderRadius = "10px";

}

function getResult() {
    let sourceImage = document.getElementById("source-image");
    sourceImage.src = fileData;
    let usedText = document.getElementById("input-used-text").value;
    let fontSize = document.getElementById("input-font-size").value;
    let backgroundColor = (document.getElementById("input-background-transparent").checked === true) ? "rgba(0,0,0,0)" : document.getElementById("input-background-color").value;
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    let len = Math.min(sourceImage.width);
    canvas.width = len;
    canvas.height = len;
    context.drawImage(sourceImage, 0, 0);
    let sourceData = context.getImageData(0, 0, len, len).data;
    console.log(sourceData);

    function getPixelsGrid(source) {
        console.log(source.length);
        let res = [];
        for (let i = 0; i < source.length; i += 4) {
            let y = Math.floor(i / (canvas.width * 4));
            let x = (i - (y * canvas.height * 4)) / 4;
            if (typeof res[x] === "undefined") {
                res[x] = [];
            }
            res[x][y] = {
                r: source[i],
                g: source[i + 1],
                b: source[i + 2],
                a: source[i + 3]
            }
        }
        return res;
    }
    let pixelsGrid = getPixelsGrid(sourceData);
    console.log(pixelsGrid[0][0]);
    function countUsedTextSize(symbol, size) {
        let block = document.createElement("span");
        block.innerHTML = symbol;
        block.style.fontSize = size + "px";
        block.style.fontFamily = "Monospace";
        document.body.appendChild(block);
        let re = [block.offsetWidth, Math.floor(block.offsetHeight * 0.8)];
        document.body.removeChild(block);
        return re;
    }
    let size = countUsedTextSize(usedText[0], fontSize);
    let usedTextWidth = size[0]
    let usedTextHeight = size[1];

    function getAvgPixelsList(grid) {
        let res = [];
        let stepX = usedTextWidth;
        let stepY = usedTextHeight;
        let countStepsX = canvas.width / stepX;
        let countStepsY = canvas.height / stepY;

        for (let y = 0; y < countStepsY; y++) {
            for (let x = 0; x < countStepsX; x++) {
                res.push({
                    x: x * stepX,
                    y: y * stepY,
                    r: grid[x * stepX][y * stepY].r || 0,
                    g: grid[x * stepX][y * stepY].g || 0,
                    b: grid[x * stepX][y * stepY].b || 0,
                    a: grid[x * stepX][y * stepY].a || 0
                });
            }
        }

        return res;
    }
    let avgPixelsList = getAvgPixelsList(pixelsGrid);

    let nextUsedChart = 0;

    function getNextUsedChart() {
        if (nextUsedChart >= usedText.length) {
            nextUsedChart = 0;
        }
        return usedText[nextUsedChart++]
    }

    function getResultData(list) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle =  backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < list.length; i++) {
            let px = list[i];
            context.fillStyle = "rgba(" + px.r +", " + px.g + ", " + px.b + ", " + px.a + ")";
            context.font = fontSize + "px Monospace";
            context.fillText(getNextUsedChart(), px.x, px.y);
        }

    }
    getResultData(avgPixelsList);
}
