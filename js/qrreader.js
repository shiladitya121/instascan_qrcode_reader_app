var video = document.createElement("video");
var canvasElement = document.getElementById("canvas");
var canvas = canvasElement.getContext("2d");
var loadingMessage = document.getElementById("loadingMessage");
var qrOutput = document.getElementById("qrOutput");

var qrcodeContainer = document.getElementById("qrcodeContainer");
var qrcodeButton = document.getElementById("qrcodeButton");

var isQrcodeProcessed = false;

//QR code turn on and off switch
function qrcodeReaderSwitch(){
  if(qrcodeContainer.hidden===true){
    qrcodeContainer.hidden = false;
    qrcodeButton.textContent = "Turn off QR code reader";

    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
      video.srcObject = stream;
      video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
      video.play();
      
      alert("before requestAnimationFrame ==> isQrcodeProcessed: " + isQrcodeProcessed);
      
      requestAnimationFrame(tick);
      
      alert("after requestAnimationFrame ==> isQrcodeProcessed: " + isQrcodeProcessed);
      
      if(isQrcodeProcessed===true){
        stream.getTracks().forEach(function(track) {
          if (track.readyState == 'live' && track.kind === 'video') {
              track.stop();
          }
        });
      }
      isQrcodeProcessed = false;
      return;
    });
  }else{
    qrcodeContainer.hidden = true;
    qrcodeButton.textContent = "Turn on QR code reader";
    return;
  }
}

//Draw a linee
function drawLine(begin, end, color) {
  canvas.beginPath();
  canvas.moveTo(begin.x, begin.y);
  canvas.lineTo(end.x, end.y);
  canvas.lineWidth = 4;
  canvas.strokeStyle = color;
  canvas.stroke();
}

function tick() {
  loadingMessage.innerText = "Loading video..."
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    loadingMessage.hidden = true;
    canvasElement.hidden = false;

    canvasElement.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
    var code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    if (code) {
      drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
      drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
      drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
      drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
      qrOutput.innerText = code.data;
      isQrcodeProcessed = true;
    } else {
      qrOutput.innerText = 'No Data Found!!!';
      
    }
  }
  requestAnimationFrame(tick);
}