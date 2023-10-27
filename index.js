const width = 640;
const heigth = 480;

let state = 'collection'
let showFaceMesh = false;

let video;
let facemesh;
let predictions = [];
let model;


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
            'upperOuterZ',
            'lowerInnerXEnd',
            'lowerInnerYEnd',
            'lowerInnerZEnd',
            'lowerOuterXEnd',
            'lowerOuterYEnd',
            'lowerOuterZEnd',
            'upperInnerXEnd',
            'upperInnerYEnd',
            'upperInnerZEnd',
            'upperOuterXEnd',
            'upperOuterYEnd',
            'upperOuterZEnd',
            'noseTipX',
            'noseTipY',
            'noseTipZ',
            'leftEyebrowUpperX',
            'leftEyebrowUpperY',
            'leftEyebrowUpperZ',
            'leftEyebrowLowerX',
            'leftEyebrowLowerY',
            'leftEyebrowLowerZ',
            'rightEyebrowUpperX',
            'rightEyebrowUpperY',
            'rightEyebrowUpperZ',
            'rightEyebrowLowerX',
            'rightEyebrowLowerY',
            'rightEyebrowLowerZ'

        ],
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
        upperOuterZ: annotations.lipsUpperOuter[0][2],
        lowerInnerXEnd: annotations.lipsLowerInner[annotations.lipsLowerInner.length - 1][0],
        lowerInnerYEnd: annotations.lipsLowerInner[annotations.lipsLowerInner.length - 1][1],
        lowerInnerZEnd: annotations.lipsLowerInner[annotations.lipsLowerInner.length - 1][2],
        lowerOuterXEnd: annotations.lipsLowerOuter[annotations.lipsLowerOuter.length - 1][0],
        lowerOuterYEnd: annotations.lipsLowerOuter[annotations.lipsLowerOuter.length - 1][1],
        lowerOuterZEnd: annotations.lipsLowerOuter[annotations.lipsLowerOuter.length - 1][2],
        upperInnerXEnd: annotations.lipsUpperInner[annotations.lipsUpperInner.length - 1][0],
        upperInnerYEnd: annotations.lipsUpperInner[annotations.lipsUpperInner.length - 1][1],
        upperInnerZEnd: annotations.lipsUpperInner[annotations.lipsUpperInner.length - 1][2],
        upperOuterXEnd: annotations.lipsUpperOuter[annotations.lipsUpperOuter.length - 1][0],
        upperOuterYEnd: annotations.lipsUpperOuter[annotations.lipsUpperOuter.length - 1][1],
        upperOuterZEnd: annotations.lipsUpperOuter[annotations.lipsUpperOuter.length - 1][2],
        noseTipX: annotations.noseTip[0][0],
        noseTipY: annotations.noseTip[0][1],
        noseTipZ: annotations.noseTip[0][2],
        leftEyebrowUpperX: annotations.leftEyebrowUpper[3][0],
        leftEyebrowUpperY: annotations.leftEyebrowUpper[3][1],
        leftEyebrowUpperZ: annotations.leftEyebrowUpper[3][2],
        leftEyebrowLowerX: annotations.leftEyebrowLower[3][0],
        leftEyebrowLowerY: annotations.leftEyebrowLower[3][1],
        leftEyebrowLowerZ: annotations.leftEyebrowLower[3][2],
        rightEyebrowUpperX: annotations.rightEyebrowUpper[3][0],
        rightEyebrowUpperY: annotations.rightEyebrowUpper[3][1],
        rightEyebrowUpperZ: annotations.rightEyebrowUpper[3][2],
        rightEyebrowLowerX: annotations.rightEyebrowLower[3][0],
        rightEyebrowLowerY: annotations.rightEyebrowLower[3][1],
        rightEyebrowLowerZ: annotations.rightEyebrowLower[3][2]
    };
    if (state === 'collection') {
        let target = {
            label: label
        }
        model.addData(inputs, target)
    } else if (state === 'prediction') {
        model.classify(inputs, getResults);
    }
}

function getResults(error, results) {
    if (error) {
        console.error(error);
        return;
    }
    let output = document.getElementById('output');
    output.textContent ='Output: ' + results[0].label + ' Confidence: ' + getPercentage(results[0].confidence);
}

function draw() {
    let faceMeshText = document.getElementById("faceMeshButton")
    image(video, 0, 0, width, heigth)
    if (showFaceMesh) {
        drawKeypoints();
        faceMeshText.textContent = "Hide Face Mesh"
    } else {
        faceMeshText.textContent = "Show Face Mesh"
    }
}

function drawKeypoints() {
    for (let i = 0; i < predictions.length; i += 1) {
        const keypoints = predictions[i].scaledMesh;

        for (let j = 0; j < keypoints.length; j += 1) {
            const [x, y] = keypoints[j];
            fill(0, 255, 0);
            ellipse(x, y, 5, 5);
        }
    }
}

function train() {
    state = 'training'
    model.normalizeData();
    let options = {
        epochs: 200,
    }
    model.train(options, whileTraining, finishedTraining)
}

function whileTraining(epoch, loss) {}

function finishedTraining() {
    state = 'prediction'
}

function getPercentage(confidence) {
    return (confidence * 100) + '%'
}

function showMesh() {
    showFaceMesh = !showFaceMesh
}
