let video;
let bodyPose;
let poses = [];
let poseHistory = []; // stores pose history
let connections;
let lastLogTime = 0;
let loggedPositions = [];
let skullImage;

function preload() {
  // Load the bodyPose model and skull image
  bodyPose = ml5.bodyPose();
  skullImage = loadImage('skull.png');
}

function setup() {
  // let canvas = createCanvas(640, 480);
  let canvas = createCanvas(windowWidth, windowHeight); // Create a full-screen canvas
  createCanvas(windowWidth, windowHeight);

  canvas.position(0, 0); // Ensure the canvas is positioned at the top left

  // Create a video capture and hide it
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();

  // Start detecting the pose from the webcam
  bodyPose.detectStart(video, gotPoses);

  // Get the skeleton connection info
  connections = bodyPose.getSkeleton();
}

function draw() {
  background(0); // black background

  // Draw the current pose first
  drawSkeleton(poses, 255); // current pose w/full opacity

  // Draw older poses with decreasing opacity
  for (let i = 0; i < poseHistory.length; i++) {
    let age = poseHistory.length - i; // older the frame, lower the opacity
    let opacity = map(age, 0, poseHistory.length, 255, 0); // Fade from full to 50 opacity
    drawSkeleton(poseHistory[i], opacity);
  }

  // Store the current pose in the history and limit the length of the history
  if (poses.length > 0) {
    poseHistory.push(poses); // Store current pose in history
  }
  if (poseHistory.length > 30) {
    poseHistory.shift(); // Limit history to last 30 frames
  }

  // Toggle fullscreen when the 'f' key is pressed
  if (keyIsPressed && key === 'f') {
    let fs = fullscreen();
    fullscreen(!fs); // Toggle fullscreen mode
    resizeCanvas(windowWidth, windowHeight); // Resize canvas when entering/exiting fullscreen
  }
}

// Automatically resize the canvas when the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Adjust canvas size
}

function drawSkeleton(poses, opacity) {
  let currentTime = millis(); // Get the current time in milliseconds

  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < connections.length; j++) {
      let pointAIndex = connections[j][0];
      let pointBIndex = connections[j][1];
      let pointA = pose.keypoints[pointAIndex];
      let pointB = pose.keypoints[pointBIndex];

      // Only draw the "bone" if both points are confident enough
      if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
        // Draw a thicker line for the bones with specified opacity
        stroke(0, 211, 0, opacity); // Green bones with variable opacity
        strokeWeight(8); // Thicker line to resemble a bone
        line(pointA.x, pointA.y, pointB.x, pointB.y);

        // Log pointA every 1 second (1000 milliseconds)
        if (currentTime - lastLogTime >= 100) {
          console.log(`pointA: x = ${pointA.x}, y = ${pointA.y}`);
          loggedPositions.push({ x: pointA.x, y: pointA.y }); // Store the logged position
          lastLogTime = currentTime; // Update the last log time
        }
      }
    }
  }

  // Draw circular joints at each keypoint
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      // Only draw a circle if the keypoint's confidence is bigger than 0.1
      if (keypoint.confidence > 0.1) {
        fill(0, 255, 0, opacity); // Green joints with variable opacity
        noStroke();
        ellipse(keypoint.x, keypoint.y, 15); // Bigger circles to represent joints
      }
    }
  }

  // Draw images at the logged positions
  drawLoggedPositions();
}

// Function to draw skull images at the stored positions
function drawLoggedPositions() {
  for (let i = 0; i < loggedPositions.length; i++) {
    let pos = loggedPositions[i];
    let scaledWidth = skullImage.width * 0.3; // Scale down to 30% of original size
    let scaledHeight = skullImage.height * 0.3;
    // image(skullImage, pos.x - scaledWidth / 2, pos.y - scaledHeight / 2, scaledWidth, scaledHeight);
    // Draw scaled skull image centered at the logged position
  }
}

function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
}
