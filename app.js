// app. 1.3.0

// Define the CSV data URL
const csvURL = "https://raw.githubusercontent.com/gammaspiral/ambient-river-levels/main/Westminster.csv";

// Initialize audio components and variables
let oscillator; // Declare oscillator here
let csvData = [];
let minDataValue;
let maxDataValue;

// Function to parse CSV data
function parseCSV(csv) {
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
// Function to map data to a broader pitch range
//function mapDataToPitch(dataValue) {
 // const minFrequency = 432; // Adjust the minimum frequency as needed
//  const maxFrequency = 1728; // Adjust the maximum frequency as needed

  // Normalize the data value to the range [0, 1]
//  const normalizedValue = (dataValue - minDataValue) / (maxDataValue - minDataValue);
//
//  // Map the normalized value to the broader frequency range
//  return minFrequency + normalizedValue * (maxFrequency - minFrequency);
//}

 //Function to map data to musical pitch
function mapDataToPitch(dataValue) {
  const minPitch = 24; // MIDI note number for c0
  const maxPitch = 60; // MIDI note number for c4
  const pitchRange = maxPitch - minPitch;

const normalizedValue = (dataValue - minDataValue) / (maxDataValue - minDataValue);
  return Math.round(minPitch + normalizedValue * pitchRange);
}


function startMusic(audioContext) {
  let index = 0;
  const interval = 2000; // Simulated data update interval (2 seconds)

  // Create a limiter
  const limiter = new Tone.Limiter(-6); // Adjust the threshold as needed
  limiter.toDestination();

// Create a waveform analyzer
const waveform = new Tone.Waveform();

// Connect the limiter to the analyzer and then to the destination
limiter.connect(waveform).toDestination();

  // Create an oscillator instance if it doesn't exist
  if (!oscillator) {
    oscillator = new Tone.Oscillator({
      type: "sine",
      volume: 0.5,
    }).connect(limiter);

    oscillator.start();
  }
// Log the waveform data to the console
setInterval(() => {
  console.log(waveform.getValue()); // Log the waveform data
}, 1000); // Adjust the interval as needed

  function playDroningTexture() {
    // Use the data to control oscillator parameters (e.g., pitch)
    const dataValue = parseFloat(csvData[index]['Height (m)']);
    const pitch = mapDataToPitch(dataValue);

    // Disconnect the oscillator before connecting it again
    oscillator.disconnect();

    // Set oscillator frequency based on the mapped pitch
    oscillator.frequency.setValueAtTime(Tone.Midi(pitch).toFrequency(), Tone.now());

    // Connect the oscillator to the limiter again
    oscillator.connect(limiter);

    // Move to the next data point
    index = (index + 1) % csvData.length;

    // Schedule the next drone
    setTimeout(playDroningTexture, interval);
  }

  // Start playing the evolving drones
  playDroningTexture();
}


document.getElementById('startButton').addEventListener('click', () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  startMusic(audioContext);
});

document.getElementById('stopButton').addEventListener('click', () => {
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = undefined;
  }
});

fetch(csvURL)
  .then((response) => response.text())
  .then((data) => {
    csvData = parseCSV(data);
    const heights = csvData.map((row) => parseFloat(row['Height (m)']));
    minDataValue = Math.min(...heights);
    maxDataValue = Math.max(...heights);
  })
  .catch((error) => {
    console.error("Error fetching CSV data:", error);
  });

document.addEventListener('DOMContentLoaded', function() {
  // Additional setup or event listeners can be added here if needed.
});

