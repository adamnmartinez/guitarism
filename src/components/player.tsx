import * as Tone from "tone";

// const synth = new Tone.PolySynth(Tone.Synth).toDestination();

const synth = new Tone.Sampler({
	urls: {
		C4: "C4.mp3",
		"D#4": "Ds4.mp3",
		"F#4": "Fs4.mp3",
		A4: "A4.mp3",
	},
	release: 1,
	//baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-acoustic/",
    baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

// Tone.loaded().then(() => {
// 	synth.triggerAttackRelease(["Eb4", "G4", "Bb4"], 4);
// });

const interpretNoteByValue = (string: string, val: number) => {
  if (val < 0) return null;
  const notes = [
    "A",
    "A#",
    "B",
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
  ];
  let oct = 0;
  let k = notes.indexOf(string == "e" ? "E" : string);
  let note = notes[k];

  switch (
    string // Determine initial octave by string
  ) {
    case "e":
      oct = 4;
      break;
    case "B":
      oct = 3;
      break;
    case "G":
      oct = 3;
      break;
    case "D":
      oct = 3;
      break;
    case "A":
      oct = 2;
      break;
    case "E":
      oct = 1;
      break;
    default:
      break;
  }

  for (let i = 0; i < val; i++) {
    k++;
    if (k > 11) k = 0;
    if (notes[k] == "C") oct++;
  }

  note = notes[k];

  if (!note) {
    throw Error;
  }

  return `${note}${oct.toString()}`;
};

const play = (tab: any, BPM: number) => {
  let series: string[][] = [];

  for (let i = 0; i < tab.length; i++) {
    Tone.getTransport().start()
    series[i] = [];
    // Interpret each note
    let tabNotes = [
      interpretNoteByValue("E", tab[i].e1),
      interpretNoteByValue("A", tab[i].a),
      interpretNoteByValue("D", tab[i].d),
      interpretNoteByValue("G", tab[i].g),
      interpretNoteByValue("B", tab[i].b),
      interpretNoteByValue("e", tab[i].e2),
    ];

    // For each detected note in a column, add it to it's corresponding place in musical series
    for (let n = 0; n < tabNotes.length; n++) {
      let note = tabNotes[n];
      if (note) {
        series[i].push(note);
      }
    }
  }
  // Play the music
  let k = 0;
  for (let col = 0; col < series.length; col++) {
    for (let n = 0; n < series[col].length; n++) {
      synth.triggerAttackRelease(series[col][n], "16n", Tone.now() + k);
    }

    k += 60 / BPM;
  }
  return k
};

export { play, interpretNoteByValue }