const width = 640;
const heigth = 480;

let video;
let facemesh;
let predictions = [];


function setup() {
    createCanvas(width, heigth);
    video = createCapture(VIDEO);
    video.size(width, heigth);

    facemesh = ml5.facemesh(video);

    facemesh.on("predict", results => {
        predictions = results;
    });

    video.hide();
}

function draw() {
    image(video, 0, 0, width, heigth)
    drawKeypoints()
}

function drawKeypoints() {
    for (let i = 0; i < predictions.length; i += 1) {
        const keypoints = predictions[i].scaledMesh;

        // Draw facial keypoints.
        for (let j = 0; j < keypoints.length; j += 1) {
            const [x, y] = keypoints[j];

            fill(0, 255, 0);
            ellipse(x, y, 5, 5);
        }
    }
}
