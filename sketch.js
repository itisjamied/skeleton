let video;
let bodyPose;
let poses = [];
let poseHistory = []; // Array to store previous frames of poses
let connections;

function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(640, 480);

  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
  // Get the skeleton connection information
  connections = bodyPose.getSkeleton();
}

function draw() {
      

  background(0); // Optional: black background to make bones more visible

  // Draw the current pose first
  drawSkeleton(poses, 255); // Current pose with full opacity

  // Draw older poses with decreasing opacity
  for (let i = 0; i < poseHistory.length; i++) {
    let age = poseHistory.length - i; // The older the frame, the lower the opacity
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
}

// Function to draw the skeleton with specified opacity
function drawSkeleton(poses, opacity) {

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
}

// Callback function for when bodyPose outputs data
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
}
