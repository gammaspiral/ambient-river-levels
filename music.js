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

// Start playing music
// Enhance the startMusic function to create evolving drones with volume and release adjustments
function startMusic() {
  let index = 0;
  const interval = 2000; // Simulated data update interval (2 seconds)

  function playDroningTexture() {
    // Use the data to control synth parameters (e.g., pitch, volume, and release time)
    const dataValue = parseFloat(csvData[index]['Height (m)']);
    const pitch = mapDataToPitch(dataValue);
    const volume = mapDataToVolume(dataValue);
    const release = mapDataToRelease(dataValue);

    // Play a sustained note with the current parameters
    synth.triggerAttack(pitch, undefined, volume);

    // Release the note after the specified release time
    synth.triggerRelease(undefined, `+${release}`);

    // Move to the next data point
    index = (index + 1) % csvData.length;

    // Schedule the next drone
    setTimeout(playDroningTexture, interval);
  }

  // Start playing the evolving drones
  playDroningTexture();
}

// Map "Height (m)" values to volume (adjust the mapping as needed)
function mapDataToVolume(dataValue) {
  // You can adjust this mapping to control volume based on the dataValue
  // For example, you can make higher values quieter relative to lower values
  // This is just a basic linear mapping, feel free to customize it
  return 1 - (dataValue / maxDataValue);
}

// Map "Height (m)" values to release time (adjust the mapping as needed)
function mapDataToRelease(dataValue) {
  // You can adjust this mapping to control release time based on the dataValue
  // For example, you can make higher values have longer release times
  // This is just a basic linear mapping, feel free to customize it
  return 0.1 + 0.4 * (dataValue / maxDataValue);
}



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
  // Add event listener for the 'startButton'
  const startButton = document.getElementById('startButton');
  if (startButton) {
    startButton.addEventListener('click', () => {
      // Create an AudioContext within a user gesture (e.g., button click)
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Initialize audio components within the user gesture event
      synth = new Tone.Synth().toDestination();
      reverb = new Tone.Reverb({
        decay: 60,
        wet: 1,
      });

      const reverbGain = new Tone.Gain().connect(reverb);
      reverbGain.toDestination();

      // Connect the synth to the reverb through the gain node
      synth.connect(reverbGain);

      // Start playing when the user clicks the "Start Music" button
      startMusic();
    });
  }

  // Add event listener for the 'stopButton'
  const stopButton = document.getElementById('stopButton');
  if (stopButton) {
    stopButton.addEventListener('click', () => {
      // Check if the synth object exists and is valid
      if (synth) {
        // Release all notes
        synth.triggerRelease();
        synth.dispose(); // Dispose of the synth to disconnect it from the audio context
        synth = undefined; // Set synth to undefined to allow reinitialization
      }
    });
  }
});
