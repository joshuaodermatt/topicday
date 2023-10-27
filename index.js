const width = 800;
const heigth = 600;

let video;


function setup() {
    createCanvas(width, heigth);
    video = createCapture(VIDEO);
    
    video.size(width, heigth);

    video.hide();
}


function draw() {
    image(video, 0, 0, width, heigth)
}