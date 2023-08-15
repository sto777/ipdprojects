import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
import "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
const demosSection = document.getElementById("demos");
const imageBlendShapes = document.getElementById("image-blend-shapes");
const videoBlendShapes = document.getElementById("video-blend-shapes");

let faceLandmarker;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;

const videoWidth = 480;

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
async function runDemo() {
  //  Read more `CopyWebpackPlugin`, copy wasm set from "https://cdn.skypack.dev/node_modules" to `/wasm`
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );  
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1
  });
   demosSection.classList.remove("invisible");


}
runDemo();

const imageContainers = document.getElementsByClassName("detectOnClick");

// Now let's go through all of these and add a click event listener.
for (let i = 0; i < imageContainers.length; i++) {
  // Add event listener to the child element which is the img element.
  imageContainers[i].children[0].addEventListener("click", handleClick);
}

// When an image is clicked, let's detect it and display results!
async function handleClick(event) {
  if (!faceLandmarker) {
    console.log("Wait for faceLandmarker to load before clicking!");
    return;
  }
  if (runningMode === "VIDEO") {
    runningMode = "IMAGE";
    await faceLandmarker.setOptions({ runningMode });
  }

  const faceLandmarkerResult = await faceLandmarker.detect(event.target);

  if (!faceLandmarkerResult || !faceLandmarkerResult.faceLandmarks || faceLandmarkerResult.faceLandmarks.length === 0) {
    console.log("No landmarks detected.");
    return;
  }
    // calculate ipd


const leftEyeLandmarks= []
const rightEyeLandmarks = []

for (const connection of FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE ){
  
  rightEyeLandmarks.push(faceLandmarkerResult.faceLandmarks[0][connection["start"]])
  rightEyeLandmarks.push(faceLandmarkerResult.faceLandmarks[0][connection["end"]])
}

for (const connection of FaceLandmarker.FACE_LANDMARKS_LEFT_EYE ){
  
  leftEyeLandmarks.push(faceLandmarkerResult.faceLandmarks[0][connection["start"]])
  leftEyeLandmarks.push(faceLandmarkerResult.faceLandmarks[0][connection["end"]])
}

// const leftEyeLandmarks = faceLandmarkerResult.faceLandmarks[0][FaceLandmarker.FACE_LANDMARKS_LEFT_EYE];
// const rightEyeLandmarks = faceLandmarkerResult.faceLandmarks[0][FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE];
console.log(faceLandmarkerResult.faceLandmarks)

const leftEyeCenter = calculateLandmarkCenter(leftEyeLandmarks);
const rightEyeCenter = calculateLandmarkCenter(rightEyeLandmarks);
console.log(FaceLandmarker.FACE_LANDMARKS_LEFT_EYE)
const ipd = calculateIPD(leftEyeCenter, rightEyeCenter);
console.log("Inter-Pupillary Distance (IPD):", ipd);
// Display IPD on the screen
const ipdResultElement = document.getElementById("ipd-result");
ipdResultElement.textContent = `Inter-Pupillary Distance (IPD): ${ipd.toFixed(2)} pixels`;
ipdResultElement.classList.remove("invisible");


  // Display the uploaded image
const uploadedImage = document.getElementById("uploaded-canvas");
uploadedImage.src = event.target.src;

  
    



  // We can call faceLandmarker.detect as many times as we like with
  // different image data each time. This returns a promise
  // which we wait to complete and then call a function to
  // print out the results of the prediction.
  
  const canvas = document.createElement("canvas");  
  canvas.setAttribute("class", "canvas");
  canvas.setAttribute("width", event.target.naturalWidth + "px");
  canvas.setAttribute("height", event.target.naturalHeight + "px");
  canvas.style.left = "0px";
  canvas.style.top = "0px";
  canvas.style.width = `${event.target.width}px`;
  canvas.style.height = `${event.target.height}px`;

  event.target.parentNode.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const drawingUtils = new DrawingUtils(ctx);
  for (const landmarks of faceLandmarkerResult.faceLandmarks) {
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_TESSELATION,
      { color: "#C0C0C070", lineWidth: 1 }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
      { color: "#30FF30" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
      { color: "#30FF30" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
      { color: "#E0E0E0" }
    );
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
      color: "#E0E0E0"
    });
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
      { color: "#30FF30" }
    );
  }
  drawBlendShapes(imageBlendShapes, faceLandmarkerResult.faceBlendshapes);
}

function drawBlendShapes(targetElement, blendShapes) {
  // This is a basic implementation that logs the blend shapes to the console.
  console.log("Blend Shapes:", blendShapes);

  // You can implement your custom logic to visualize the blend shapes here,
  // such as updating the UI or drawing on the canvas.
}
// Remove all landmarks drawn before
  
const uploadImageInput = document.getElementById("upload-image-input");
const previewButton = document.getElementById("preview-button");
const removeButton = document.getElementById("remove-button");
const uploadedCanvas = document.getElementById("uploaded-canvas");


// JavaScript to toggle the visibility of ipd-result
document.addEventListener("DOMContentLoaded", function () {
  const ipdResultElement = document.getElementById("ipd-result");
  const toggleIPDButton = document.getElementById("toggle-ipd-button");

  toggleIPDButton.addEventListener("click", function () {
    ipdResultElement.classList.toggle("invisible");
  });
});
function calculateLandmarkCenter(landmarks) {
  console.log("Received landmarks:", landmarks);

  if (!landmarks || landmarks.length === 0) {
    console.log("No landmarks detected.");
    return { x: 0, y: 0 };
  }

  let xSum = 0;
  let ySum = 0;

  for (const landmark of landmarks) {
    xSum += landmark.x;
    ySum += landmark.y;
  }

  return {
    x: xSum / landmarks.length,
    y: ySum / landmarks.length
  };
}
// function calculateLandmarkCenter(landmarks) {
//   let xSum = 0;
//   let ySum = 0;

//   for (const landmark of landmarks) {
//     xSum += landmark.x;
//     ySum += landmark.y;
//   }

//   return {
//     x: xSum / landmarks.length,
//     y: ySum / landmarks.length
//   };
// }

function calculateIPD(leftEyeCenter, rightEyeCenter) {
  const dx = leftEyeCenter.x - rightEyeCenter.x;
  const dy = leftEyeCenter.y - rightEyeCenter.y;

  return Math.sqrt(dx * dx + dy * dy);
}


// Add an event listener to the "Preview" button
previewButton.addEventListener("click", () => {
  // Get the uploaded file from the input element
  const file = uploadImageInput.files[0];
  if (!file) {
    alert("Please choose an image to preview.");
    return;
  }
  // Read the file and set it as the source of the canvas element
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      uploadedCanvas.width = img.width;
      uploadedCanvas.height = img.height;
      const ctx = uploadedCanvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Add an event listener to the "Remove" button
removeButton.addEventListener("click", () => {
  const ctx = uploadedCanvas.getContext("2d");
  ctx.clearRect(0, 0, uploadedCanvas.width, uploadedCanvas.height);
});
// // const demosSection = document.getElementById("demos");
// const ipdResultElement = document.getElementById("ipd-result");
// const toggleIPDButton = document.getElementById("toggle-ipd-button");
// const uploadedImage = document.getElementById("uploaded-image");
// // const uploadedCanvas = document.getElementById("uploaded-canvas");
// const canvas = document.getElementById("canvas");

// let faceMesh;
// let videoElement;

// // Load the MediaPipe Face Mesh model
// async function loadFaceMesh() {
//   faceMesh = new FaceMesh({
//     locateFile: (file) => {
//       return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
//     },
//   });
//   await faceMesh.setOptions({ maxNumFaces: 1 });
//   await faceMesh.onResults(handleResults);

//   videoElement = document.createElement("video");
//   videoElement.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
//   videoElement.play();
// }

// // Start the Face Mesh and IPD calculation
// loadFaceMesh();

// // Handle the face mesh results
// function handleResults(results) {
//   console.log("Face Mesh Results:", results);

//   if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
//     const landmarks = results.multiFaceLandmarks[0];
//     console.log("Landmarks:", landmarks);
//   if (!results.multiFaceLandmarks || !results.multiFaceLandmarks[0]) 
    
//   ipdResultElement.textContent = "No face landmarks detected.";
//     return;
//   }

//   const leftEyeLandmarks = results.multiFaceLandmarks[0][133]; // Left eye center
//   const rightEyeLandmarks = results.multiFaceLandmarks[0][362]; // Right eye center

//   const leftEyeCenter = calculateLandmarkCenter(leftEyeLandmarks);
//   const rightEyeCenter = calculateLandmarkCenter(rightEyeLandmarks);

//   const ipd = calculateIPD(leftEyeCenter, rightEyeCenter);
//   ipdResultElement.textContent = `Inter-Pupillary Distance (IPD): ${ipd.toFixed(2)} pixels`;

//   // Draw landmarks on the uploaded canvas
//   const ctx = uploadedCanvas.getContext("2d");
//   ctx.clearRect(0, 0, uploadedCanvas.width, uploadedCanvas.height);
//   ctx.drawImage(videoElement, 0, 0, uploadedCanvas.width, uploadedCanvas.height);
//   drawLandmarks(ctx, results.multiFaceLandmarks[0], "#FF3030");
// }

// // Add event listener to toggle IPD visibility
// toggleIPDButton.addEventListener("click", function () {
//   ipdResultElement.classList.toggle("invisible");
// });

// // Calculate the center of an array of landmarks
// // function calculateLandmarkCenter(landmarks) {
// //   let xSum = 0;
// //   let ySum = 0;

// //   for (const landmark of landmarks) {
// //     xSum += landmark.x;
// //     ySum += landmark.y;
// //   }

// //   return {
// //     x: xSum / landmarks.length,
// //     y: ySum / landmarks.length,
// //   };
// // }

// // Calculate Inter-Pupillary Distance
// // function calculateIPD(leftEyeCenter, rightEyeCenter) {
// //   const dx = leftEyeCenter.x - rightEyeCenter.x;
// //   const dy = leftEyeCenter.y - rightEyeCenter.y;

// //   return Math.sqrt(dx * dx + dy * dy);
// // }

// // Draw landmarks on the canvas
// function drawLandmarks(ctx, landmarks, color) {
//   ctx.fillStyle = color;
//   for (const landmark of landmarks) {
//     ctx.beginPath();
//     ctx.arc(landmark.x * uploadedCanvas.width, landmark.y * uploadedCanvas.height, 4, 0, 2 * Math.PI);
//     ctx.fill();
//   }
// }

// // Handle preview button click
// document.getElementById("preview-button").addEventListener("click", () => {
//   const file = uploadImageInput.files[0];
//   if (!file) {
//     alert("Please choose an image to preview.");
//     return;
//   }

//   const reader = new FileReader();
//   reader.onload = (event) => {
//     uploadedImage.src = event.target.result;
//   };
//   reader.readAsDataURL(file);
// });

// // Handle remove button click
// document.getElementById("remove-button").addEventListener("click", () => {
//   uploadedCanvas.getContext("2d").clearRect(0, 0, uploadedCanvas.width, uploadedCanvas.height);
//   uploadedImage.src = "";
//   ipdResultElement.classList.add("invisible");
// });
