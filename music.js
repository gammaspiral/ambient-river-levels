// music.js

// Define the CSV data URL
const csvURL = "https://raw.githubusercontent.com/gammaspiral/ambient-river-levels/main/Westminster.csv";

// Initialize audio components and variables
let synth; // Declare synth here
let reverb;
let csvData = [];
let minDataValue;
let maxDataValue;

// Function to parse CSV data
function parseCSV(csv) {
  // Split the CSV into rows
  const rows = csv.trim().split("\n");
  const headers = rows[0].split(",");
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].split(",");
    const entry = {};
    for (let j = 0; j < headers.length; j++) {
      entry[headers[j].trim()] = row[j].trim();
    }
    data.push(entry);
  }

  return data;
}

// Function to map data to musical pitch
function mapDataToPitch(dataValue) {
  const minPitch = 36; // MIDI note number for C2
  const maxPitch = 60; // MIDI note number for C5
  const pitchRange = maxPitch - minPitch;
  const normalizedValue = (dataValue - minDataValue) / (maxDataValue - minDataValue);
  return Math.round(minPitch + normalizedValue * pitchRange);
}

function startMusic(audioContext) {
  let index = 0;
  const interval = 2000; // Simulated data update interval (2 seconds);
  let lastScheduledTime = audioContext.currentTime;

    // Create a FeedbackDelay instance with the desired settings
  const delay = new Tone.FeedbackDelay({
    delayTime: 0.2, // Adjust the delay time (in seconds) as needed
    feedback: 0.7, // Adjust the feedback amount
  });
   // Connect the delay effect in the audio chain
  synth.connect(delay);
  function playDroningTexture() {
    // Use the data to control synth parameters (e.g., pitch and volume)
    const dataValue = parseFloat(csvData[index]['Height (m)']);
    const pitch = mapDataToPitch(dataValue);
    const volume = 0.5;
    const releaseTime = 1.5; // Adjust the release time as needed

    // Calculate the duration of the previous note (in milliseconds)
    const previousNoteDuration = releaseTime * 1000;

    // Calculate the delay for the next note (in milliseconds)
    const delay = previousNoteDuration;

    // Calculate the time for scheduling the next note
    const nextScheduledTime = lastScheduledTime + (interval / 1000);

    // Schedule the next note with the specified release time
    synth.triggerAttackRelease(pitch, '1n', nextScheduledTime, releaseTime, volume);

    // Update the last scheduled time
    lastScheduledTime = nextScheduledTime;

    // Move to the next data point
    index = (index + 1) % csvData.length;

    // Schedule the next drone
    setTimeout(playDroningTexture, interval);
  }

  // Start playing the evolving drones
  playDroningTexture(synth);
}


// Create an AudioContext within a user gesture (e.g., button click)
document.getElementById('startButton').addEventListener('click', () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Initialize audio components within the user gesture event
  synth = new Tone.Synth().toDestination();
  reverb = new Tone.Reverb({
    decay: 600,
    wet: 1,
  });

  const reverbGain = new Tone.Gain().connect(reverb);
  reverbGain.toDestination();

  // Connect the synth to the reverb through the gain node
  synth.connect(reverbGain);

  // Start playing when the user clicks the "Start Music" button
  startMusic(audioContext);
});

// Add event listener for the 'stopButton'
document.getElementById('stopButton').addEventListener('click', () => {
  // Check if the synth object exists and is valid
  if (synth) {
    // Release all notes
    synth.triggerRelease();
    synth.dispose(); // Dispose of the synth to disconnect it from the audio context
    synth = undefined; // Set synth to undefined to allow reinitialization
  }
});

// Fetch CSV data from the URL
fetch(csvURL)
  .then((response) => response.text())
  .then((data) => {
    // Parse the CSV data into an array of objects
    csvData = parseCSV(data);

    // Calculate min and max values dynamically from the CSV data
    const heights = csvData.map((row) => parseFloat(row['Height (m)']));
    minDataValue = Math.min(...heights);
    maxDataValue = Math.max(...heights);
  })
  .catch((error) => {
    console.error("Error fetching CSV data:", error);
  });

// Create audio components and event listeners within the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
  // You can add any additional setup or event listeners here if needed.
});


