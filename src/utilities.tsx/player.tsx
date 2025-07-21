import * as Tone from "tone";
//@ts-ignore
import GuitarAcousticMp3 from 'tonejs-instrument-guitar-acoustic-mp3';

let synth = new GuitarAcousticMp3().toDestination();

const interpretNoteByValue = (startNote: string, startOctave: number, val: number, capo: number) => {
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

  let oct = startOctave;
  let k = notes.indexOf(startNote);

  // Starting Note
  let note = notes[k];

  // Count up to tab value to find note.
  for (let i = 0; i < val + capo; i++) {
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

const play = (tuning: Array<string>, capo: number, tab: any, BPM: number) => {
  let series: string[][] = [];

  for (let i = 0; i < tab.length; i++) {
    Tone.getTransport().start()
    series[i] = [];
    // Interpret each note
    let tabNotes = [
      interpretNoteByValue(tuning[5], 4, tab[i][5], capo),
      interpretNoteByValue(tuning[4], 3, tab[i][4], capo),
      interpretNoteByValue(tuning[3], 3, tab[i][3], capo),
      interpretNoteByValue(tuning[2], 3, tab[i][2], capo),
      interpretNoteByValue(tuning[1], 2, tab[i][1], capo),
      interpretNoteByValue(tuning[0], 2, tab[i][0], capo),
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
      synth.triggerAttackRelease(series[col][n], "1n", Tone.now() + k);
    }

    k += 60 / BPM;
  }
  return k
};

const stopPlayback = () => {
  synth.dispose()
  synth = new GuitarAcousticMp3().toDestination();
}

export { play, stopPlayback }