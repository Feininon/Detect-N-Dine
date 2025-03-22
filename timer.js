// Voice Recognition Setup
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = true;  // Keep listening indefinitely
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// Load alarm sound
const alarmSound = new Audio("ooo.mp3"); // Ensure this file exists
alarmSound.preload = "auto";
alarmSound.loop = true;
alarmSound.load();

// Ensure audio can play
document.addEventListener("click", function allowAudio() {
    alarmSound.play().then(() => {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }).catch(err => console.warn("Audio play blocked:", err));

    document.removeEventListener("click", allowAudio);
});

// Function to start voice recognition
let isListening = false;

function startListening() {
    if (!isListening) {
        recognition.start();
        isListening = true;
        console.log("Voice recognition started...");
    }
}

// Restart listening if it stops
recognition.onend = function () {
    if (isListening) {
        console.log("Restarting voice recognition...");
        recognition.start();
    }
};

// Handle voice commands
recognition.onresult = function (event) {
    let transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
    console.log("Recognized:", transcript);

    if (transcript.includes("next")) {
        document.getElementById("nextStepBtn")?.click();
    } else if (transcript.includes("previous")) {
        document.getElementById("prevStepBtn")?.click();
    } else {
        let match = transcript.match(/(\d+)\s*minutes?/);
        if (match) {
            let minutes = parseInt(match[1]);
            if (!isNaN(minutes) && minutes > 0) {
                setCountdown(minutes);
            } else {
                showNotification("Invalid time. Try again.", "error");
            }
        } else {
            showNotification("Couldn't understand. Say 'Set alarm for 5 minutes' or 'Next'.", "error");
        }
    }
};

// Ensure Next/Previous buttons exist
function ensureStepButtons() {
    let nextStepBtn = document.getElementById("nextStepBtn");
    let prevStepBtn = document.getElementById("prevStepBtn");

    if (!nextStepBtn) {
        nextStepBtn = document.createElement("button");
        nextStepBtn.id = "nextStepBtn";
        nextStepBtn.innerText = "Next";
        nextStepBtn.onclick = () => console.log("Next clicked"); // Replace with actual function
        document.body.appendChild(nextStepBtn);
    }

    if (!prevStepBtn) {
        prevStepBtn = document.createElement("button");
        prevStepBtn.id = "prevStepBtn";
        prevStepBtn.innerText = "Previous";
        prevStepBtn.onclick = () => console.log("Previous clicked"); // Replace with actual function
        document.body.appendChild(prevStepBtn);
    }

    nextStepBtn.style.display = "inline-block";
    prevStepBtn.style.display = "inline-block";
}

// Start countdown timer
function setCountdown(minutes) {
    let remainingTime = minutes * 60;
    showPopupButton(remainingTime);

    let timerInterval = setInterval(() => {
        remainingTime--;
        updatePopupButton(remainingTime);

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            playAlarm();
            showNotification("⏰ Time's up! Click to stop alarm.", "alarm", stopAlarm);
            removePopupButton();
        }
    }, 1000);
}

// Play the alarm sound
function playAlarm() {
    alarmSound.currentTime = 0;
    alarmSound.play().catch(err => console.error("Error playing sound:", err));
}

// Stop the alarm
function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
}

// Show countdown button
function showPopupButton(timeInSeconds) {
    let button = document.createElement("button");
    button.innerText = formatTime(timeInSeconds);
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgb(46, 26, 65);
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 9999;
    `;
    button.id = "alarmButton";
    button.onclick = removePopupButton;

    document.body.appendChild(button);
}

// Update countdown button
function updatePopupButton(timeInSeconds) {
    let button = document.getElementById("alarmButton");
    if (button) button.innerText = formatTime(timeInSeconds);
}

// Remove countdown button
function removePopupButton() {
    let button = document.getElementById("alarmButton");
    if (button) button.remove();
}

// Format time as MM:SS
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

// Create floating voice activation button
function createVoiceButton() {
    let voiceButton = document.createElement("button");
    voiceButton.innerText = "🎤";
    voiceButton.style.cssText = `
        position: fixed;
        bottom: 70px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;
        background: #423E3D;
        color: white;
        font-size: 24px;
        cursor: pointer;
        z-index: 9999;
    `;
    voiceButton.onclick = startListening;
    document.body.appendChild(voiceButton);
}

// Show notification (instead of alert)
function showNotification(message, type = "info", onClickAction = null) {
    let notification = document.createElement("div");
    notification.innerText = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 50px;
        right: 20px;
        background: ${type === "alarm" ? "red" : "#333"};
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        box-shadow: 0px 0px 10px rgba(0,0,0,0.3);
        z-index: 1000;
    `;

    if (onClickAction) {
        notification.onclick = () => {
            onClickAction();
            notification.remove();
        };
    } else {
        setTimeout(() => notification.remove(), 3000);
    }

    document.body.appendChild(notification);
}

// Add buttons when the DOM loads
document.addEventListener("DOMContentLoaded", () => {
    createVoiceButton();
    ensureStepButtons();
});
