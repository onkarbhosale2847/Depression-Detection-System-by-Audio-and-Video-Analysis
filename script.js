let currentQuestion = 1;
let timerInterval;
let startTime;
let stream;
let mediaRecorder;
let recordedChunks = [];
let synth = window.speechSynthesis;
let utterance = new SpeechSynthesisUtterance();

// Set the rate of speech
utterance.rate = 0.8; // Adjust this value as needed (lower value means slower speech)

// Define the questions
const questions = [
    "How are you feeling today?",
    "Have you been experiencing changes in your sleep patterns?",
    "Do you find it difficult to concentrate on tasks or make decisions?",
    "Have you lost interest in activities that you used to enjoy?",
    "Are you experiencing changes in your appetite or weight?",
    "Do you feel hopeless or worthless?",
    "Have you had thoughts of harming yourself or ending your life?",
    "Do you feel more irritable or agitated than usual?",
    "Have you experienced physical symptoms such as headaches or stomachaches without any clear cause?",
    "Have you withdrawn from social activities or isolated yourself from friends and family?"
];

// Display question number and read out the question
function displayQuestion(questionNumber) {
    document.getElementById('questionNumber').textContent = `Question ${questionNumber}`;
    speak(questions[questionNumber - 1]);
}

function speak(text) {
    utterance.text = text;
    synth.speak(utterance);
}

function startAnswer(questionNumber) {
    if (questionNumber === 1) {
        // Display question number and read out the question
        displayQuestion(questionNumber);
    }
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(function (userStream) {
            stream = userStream;
            const videoElement = document.createElement('video');
            videoElement.srcObject = userStream;
            videoElement.autoplay = true;
            videoElement.style.width = '320px'; // Set the width of the video element
            videoElement.style.height = '240px'; // Set the height of the video element
            document.getElementById(`question${questionNumber}`).appendChild(videoElement);

            // Start the timer and recording only after obtaining camera permission
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 1000);
            document.getElementById(`startAnswerBtn${questionNumber}`).disabled = true;
            document.getElementById(`endAnswerBtn${questionNumber}`).disabled = false;
            startRecording(userStream);
        })
        .catch(function (err) {
            console.error('Error accessing camera: ', err);
            alert('Error accessing camera. Please allow camera access to proceed.');
        });
}

function endAnswer(questionNumber) {
    clearInterval(timerInterval);
    const endTime = Date.now();
    const timeTaken = Math.round((endTime - startTime) / 1000); // Time taken in seconds
    alert('Response has been recorded.');

    // Stop video recording
    stopRecording();
    // Stop camera stream
    stopCamera();
    // Send the recorded audio to the backend
    sendRecordedAudio(recordedChunks, timeTaken);
    // Reset timer and move to next question or redirect to result page
    resetTimer();
    if (currentQuestion < 10) {
        showNextQuestion();
    } else {
        // Redirect to result page
        window.location.href = 'result.html';
    }
}

function startRecording(stream) {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };
    mediaRecorder.start();
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });
    }
}

function sendRecordedAudio(audioChunks, timeTaken) {
    // Convert audio chunks to Blob
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

    // Send audioBlob to the backend (You need to implement this)
    // Example using FormData to send the audio file:
    /*
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('timeTaken', timeTaken);

    fetch('/upload-audio', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to upload audio');
        }
        console.log('Audio uploaded successfully');
    })
    .catch(error => {
        console.error('Error uploading audio:', error);
    });
    */
}

function updateTimer() {
    const currentTime = Date.now();
    const elapsedTime = Math.round((currentTime - startTime) / 1000); // Elapsed time in seconds
    document.getElementById('timer').textContent = `Time Elapsed: ${elapsedTime} seconds`;
}

function resetTimer() {
    document.getElementById('timer').textContent = '';
}

function showNextQuestion() {
    document.getElementById(`question${currentQuestion}`).style.display = 'none';
    currentQuestion++;
    if (currentQuestion <= 10) {
        // Display question number and read out the question
        displayQuestion(currentQuestion);
        document.getElementById(`question${currentQuestion}`).style.display = 'block';
    }
}
