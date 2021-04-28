const { useState } = require("react")


function App() {
  const [isRecording, setIsRecording] = useState(false);

  async function getUserMedia(){ 
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
        navigator.mediaDevices.getUserMedia = function(constraintObj) {
            let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }
            return new Promise(function(resolve, reject) {
                getUserMedia.call(navigator, constraintObj, resolve, reject);
            });
        }
      }
  }

  const [mediaRecorder, setMediaRecorder] = useState(null);

  const chunks = [];

  async function recordScreen(){
    await getUserMedia();
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { 
        facingMode: "user", 
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 } 
    } 
    }).then(userStream => {
      navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true
      }).then((screenStream)=>{
        const videoElement = document.createElement('video');
        videoElement.srcObject = screenStream;
        const appElement = document.querySelector('.App');
        videoElement.width = 640;
        videoElement.height = 480;
        appElement.appendChild(videoElement);
        videoElement.play();

        const userAudio = userStream.getAudioTracks()[0]
        screenStream.addTrack(userAudio);

        const mediaRecorder = new MediaRecorder(screenStream);
        mediaRecorder.start();
        setIsRecording(true);
        setMediaRecorder(mediaRecorder);
        mediaRecorder.ondataavailable = function(e) {
          console.log('chunks')
          chunks.push(e.data);
          const blob = new Blob(chunks, { 'type' : 'video/webm' })
          const blobUrl = URL.createObjectURL(blob);
          console.log(blobUrl);
          setIsRecording(false);
          videoElement.remove()
        }
        mediaRecorder.onStop = () =>{
          console.log("data available after MediaRecorder.stop() called.");
          setIsRecording(false);
        }
      })
    })
    
  }

  function stopRecord()
  {
    if(mediaRecorder.state === 'recording')
      mediaRecorder.stop();
  }

  return (
    <div className="App">
      <button onClick={!isRecording ? recordScreen : stopRecord}>{!isRecording?'Gravar':'Parar'}</button>
    </div>
  );
}

export default App;
