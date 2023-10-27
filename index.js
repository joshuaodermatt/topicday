const width = 640;
const heigth = 480;

let video;
let facemesh;
let predictions = [];
let model;
let trainingData = [];
let state = 'collection'


function setup() {
    createCanvas(width, heigth);
    let options = {
        inputs: [
            'lowerInnerX',
            'lowerInnerY',
            'lowerInnerZ',
            'lowerOuterX',
            'lowerOuterY',
            'lowerOuterZ',
            'upperInnerX',
            'upperInnerY',
            'upperInnerZ',
            'upperOuterX',
            'upperOuterY',
            'upperOuterZ'],
        outputs: ['label'],
        task: 'classification',
        debug: true
    }

    model = ml5.neuralNetwork(options)

    video = createCapture(VIDEO);
    video.size(width, heigth);

    facemesh = ml5.facemesh(video);

    facemesh.on("predict", results => {
        predictions = results;
    });

    video.hide();
}

function recordExpression(label) {
    let lastPrediction = predictions.length - 1
    let annotations = predictions[lastPrediction].annotations
    let inputs = {
        lowerInnerX: annotations.lipsLowerInner[0][0],
        lowerInnerY: annotations.lipsLowerInner[0][1],
        lowerInnerZ: annotations.lipsLowerInner[0][2],
        lowerOuterX: annotations.lipsLowerOuter[0][0],
        lowerOuterY: annotations.lipsLowerOuter[0][1],
        lowerOuterZ: annotations.lipsLowerOuter[0][2],
        upperInnerX: annotations.lipsUpperInner[0][0],
        upperInnerY: annotations.lipsUpperInner[0][1],
        upperInnerZ: annotations.lipsUpperInner[0][2],
        upperOuterX: annotations.lipsUpperOuter[0][0],
        upperOuterY: annotations.lipsUpperOuter[0][1],
        upperOuterZ: annotations.lipsUpperOuter[0][2]
    };
    if (state === 'collection') {
        let target = {
            label: label
        }
        model.addData(inputs, target)
    } else if (state === 'prediction') {
        model.classify(inputs, getResults);

    }

    console.log(inputs)
}

function getResults(error, results) {
    if (error) {
        console.error(error);
        return;
    }
    console.log(results)

    let output = document.getElementById('output');
    output.textContent ='Output: ' + results[0].label + ' Confidence: ' +results[0].confidence;
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

function train() {
    state = 'training'
    console.log('Starting Training')
    model.normalizeData();
    let options = {
        epochs: 200,
    }
    model.train(options, whileTraining, finishedTraining)
}

function whileTraining(epoch, loss) {
    console.log(epoch)
}

function finishedTraining() {
    console.log('finished Training')
    state = 'prediction'
}

