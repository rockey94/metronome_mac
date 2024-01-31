import React, { useEffect, useState, useRef } from "react";
import "./App.css";

const App = () => {
  const [playing, setPlaying] = useState(false);
  const [count, setCount] = useState(0); // Initialize count to 0 instead of -1
  const [tempo, setTempo] = useState(120);
  const [scale, setScale] = useState("major");
  const [rootNote, setRootNote] = useState("C"); // for note name
  const [rootFrequency, setRootFrequency] = useState(261.63);
  const beatIndicators = useRef([]);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(0);

  const [beatCount, setBeatCount] = useState(0); // Initialize to 0
  const [scaleNotes, setScaleNotes] = useState([]);
  const [mode, setMode] = useState("regular"); // Default mode is 'regular'
  const [randomFrequencies, setRandomFrequencies] = useState([]); // State variable for random frequencies

  const scales = {
    major: [0, 2, 4, 5, 7, 9, 11, 12],
    minor: [0, 2, 3, 5, 7, 8, 10, 12],
    wholeTone: [0, 2, 4, 6, 8, 10, 12],
    harmonicMinor: [0, 2, 3, 5, 7, 8, 11, 12],
    pentatonicMajor: [0, 2, 4, 7, 9, 12],
    pentatonicMinor: [0, 3, 5, 7, 10, 12],
    blues: [0, 3, 5, 6, 7, 10, 12],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    dorian: [0, 2, 3, 5, 7, 9, 10, 12],
    phrygian: [0, 1, 3, 5, 7, 8, 10, 12],
    lydian: [0, 2, 4, 6, 7, 9, 11, 12],
    mixolydian: [0, 2, 4, 5, 7, 9, 10, 12],
    aeolian: [0, 2, 3, 5, 7, 8, 10, 12],
    locrian: [0, 1, 3, 5, 6, 8, 10, 12],
    diminished: [0, 2, 3, 5, 6, 8, 9, 11, 12],
    wholeHalfDiminished: [0, 2, 3, 5, 6, 8, 9, 11, 12],
    halfWholeDiminished: [0, 1, 3, 4, 6, 7, 9, 10, 12],
    augmented: [0, 3, 4, 7, 8, 11, 12],
    doubleHarmonic: [0, 1, 4, 5, 7, 8, 11, 12],
    enigmatic: [0, 1, 4, 6, 8, 10, 12],
  };

  const notes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  const noteToNum = {
    C: 261.63,
    "C#": 277.18,
    D: 293.66,
    "D#": 311.13,
    E: 329.63,
    F: 349.23,
    "F#": 369.99,
    G: 392.0,
    "G#": 415.3,
    A: 440.0,
    "A#": 466.16,
    B: 493.88,
  };
  const generateScale = (root, intervals) => {
    return intervals.map((interval) => root * Math.pow(2, interval / 12));
  };
  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "regular" ? "random" : "regular"));
  };
  useEffect(() => {
    beatIndicators.current = Array.from(
      { length: beatsPerMeasure },
      () => null
    );
  }, [beatsPerMeasure]);

  useEffect(() => {
    const scaleNotes = scales[scale];
    const repeatedScaleNotes = [];
    let index = 0;
    while (repeatedScaleNotes.length < beatsPerMeasure) {
      repeatedScaleNotes.push(scaleNotes[index % scaleNotes.length]);
      index++;
    }
    setScaleNotes(repeatedScaleNotes);
    setBeatCount(beatsPerMeasure);
    setCount(-1);
    setBeatsPerMeasure(scales[scale].length);
  }, [scale, beatsPerMeasure]);

  useEffect(() => {
    const scaleNotes = scales[scale];
    setBeatsPerMeasure(scaleNotes.length);
  }, [scale]);

  useEffect(() => {
    beatIndicators.current = Array.from(
      { length: beatsPerMeasure },
      () => null
    );
  }, [beatsPerMeasure]);

  useEffect(() => {
    setPlaying(false);

    const scaleNotes = scales[scale];
    const repeatedScaleNotes = [];
    let index = 0;
    while (repeatedScaleNotes.length < beatsPerMeasure) {
      repeatedScaleNotes.push(scaleNotes[index % scaleNotes.length]);
      index++;
    }
    setScaleNotes(repeatedScaleNotes);
    setBeatCount(beatsPerMeasure);
    setCount(-1);
    setBeatsPerMeasure(scales[scale].length);

    // setTimeout(() => {
    //   setPlaying(true);
    // }, 100); // Delay to ensure proper resetting
  }, [scale]);

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  useEffect(() => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    let oscillator = null;
    let count = -1;

    const interval = setInterval(() => {
      if (playing) {
        const currentScale = generateScale(rootFrequency, scales[scale]);
        count = (count + 1) % beatsPerMeasure;
        setCount(count); // Update the beat indicators

        let frequency;
        if (mode === "regular") {
          frequency = currentScale[count];
        } else if (mode === "random") {
          if (randomFrequencies.length < 8) {
            const randomIndex = Math.floor(Math.random() * currentScale.length);
            frequency = currentScale[randomIndex];
            setRandomFrequencies((prevFrequencies) => [
              ...prevFrequencies,
              frequency,
            ]);
          } else {
            frequency = randomFrequencies[count % 8];
          }
        }

        if (Number.isFinite(frequency)) {
          oscillator = createAndStartOscillator(audioContext, frequency);
        } else {
          console.error("Invalid frequency:", frequency);
        }
      }
    }, (60 / tempo) * 1000);

    return () => {
      clearInterval(interval);
      if (oscillator) {
        oscillator.stop();
      }
    };
  }, [
    playing,
    tempo,
    scale,
    rootFrequency,
    mode,
    beatsPerMeasure,
    randomFrequencies,
  ]);

  function createAndStartOscillator(audioContext, frequency) {
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
    return oscillator;
  }
  function createAndStartOscillator(audioContext, frequency) {
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
    return oscillator;
  }
  useEffect(() => {
    if (beatIndicators.current[count]) {
      const indicator = beatIndicators.current[count];
      const animationDuration = (60 / tempo) * 1000 - 10; // Adjust the duration
      const animationColor = getRandomColor();

      indicator.style.transition = `background-color ${animationDuration}ms`;
      indicator.style.backgroundColor = animationColor;

      setTimeout(() => {
        indicator.style.backgroundColor = "grey";
      }, animationDuration);
    }
  }, [count, tempo]);

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function noteToFrequency(note) {
    return noteToNum[note];
  }

  const handleRootNoteChange = (e) => {
    const selectedNote = e.target.value;
    const frequency = noteToFrequency(selectedNote);
    setRootNote(selectedNote); // update note name
    setRootFrequency(frequency); // update frequency
    setCount(-1);
  };

  const totalBeats = beatIndicators.current.length;

  return (
    <div className="App">
      <h1>Metronome</h1>
      <div>
        {[...Array(totalBeats)].map((_, i) => (
          <div
            ref={(el) => (beatIndicators.current[i] = el)}
            key={i}
            style={{
              display: "inline-block",
              margin: "0 5px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "grey",
              border: "1px solid black",
              animation:
                count % totalBeats === i
                  ? "combined 1s linear infinite"
                  : "none",
            }}
          />
        ))}
      </div>
      <button
        onClick={() => {
          setCount(-1); // Initialize count to 0
          setPlaying((prevPlaying) => !prevPlaying);
        }}
      >
        {playing ? "Stop" : "Start"}
      </button>
      <div className="tempo" style={{ position: "relative" }}>
        <input
          type="range"
          min="50"
          max="1000"
          step="50"
          value={tempo}
          onChange={(e) => setTempo(e.target.value)}
          style={{ color: "blue", position: "absolute", zIndex: "1" }}
        />
        <div style={{ position: "relative", zIndex: "2" }}>Tempo: {tempo}</div>
      </div>
      <div>
        <label>
          Root Note:
          <select value={rootNote} onChange={handleRootNoteChange}>
            {notes.map((note, index) => (
              <option key={index} value={note}>
                {note}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>Scale: </label>
        <select value={scale} onChange={(e) => setScale(e.target.value)}>
          <option value="major">Major</option>
          <option value="minor">Minor</option>
          <option value="wholeTone">Whole Tone</option>
          <option value="harmonicMinor">Harmonic Minor</option>
          <option value="pentatonicMajor">Pentatonic Major</option>
          <option value="pentatonicMinor">Pentatonic Minor</option>
          <option value="blues">Blues</option>
          <option value="chromatic">Chromatic</option>
          <option value="dorian">Dorian</option>
          <option value="phrygian">Phrygian</option>
          <option value="lydian">Lydian</option>
          <option value="mixolydian">Mixolydian</option>
          <option value="aeolian">Aeolian</option>
          <option value="locrian">Locrian</option>
          <option value="diminished">Diminished</option>
          <option value="wholeHalfDiminished">Whole Half Diminished</option>
          <option value="halfWholeDiminished">Half Whole Diminished</option>
          <option value="augmented">Augmented</option>
          <option value="doubleHarmonic">Double Harmonic</option>
          <option value="enigmatic">Enigmatic</option>
        </select>
        <button onClick={toggleMode}>
          {mode === "regular" ? "Random Frequency Mode" : "Regular Mode"}
        </button>
      </div>
    </div>
  );
};

export default App;
