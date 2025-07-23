import { ChangeEvent } from "react";
import * as Tone from "tone";
//@ts-ignore
import GuitarAcousticMp3 from 'tonejs-instrument-guitar-acoustic-mp3';

const synth = new GuitarAcousticMp3().toDestination();
const notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

const Fretboard = (props: {
  write: Function
  renderTabs: Function
  handleTuning: Function
  tuning: string[]
  capo: number
}) => {
  const capoSetting = props.capo

  const writeNote = (val: number, s: number) => {
    props.write(val, s);
    props.renderTabs();
  };

  const handleTuningSelect = (e: ChangeEvent, s: number) => {
    e.preventDefault()
    let target = e.currentTarget as HTMLInputElement
    props.handleTuning(target.value, s)
  }

  const Fret = (props: {
    note: string
    stringNumber: number
    octave: number
    val: number
    displayNote: string
  }) => {

    return (
      <button
        onClick={() => {
          // DEBUG Log fret data
          console.log(
            `Note ${props.note + props.octave}`,
            `[String ${props.stringNumber}]`,
            `- Fret Value ${props.val}`, `- Displayed As ${props.displayNote}`
          );
          
          // Play Sound
          synth.triggerAttackRelease(
            props.note + props.octave,
            "4n",
            Tone.now(),
          );
          // Write Note to Tab
          writeNote(props.val, props.stringNumber);
        }}
        className="note"
      >
        {props.displayNote}
      </button>
    );
  };

  const String = (props: {
    startNote: string,
    startOctave: number,
    snum: number
  }) => {
    const frets: any[] = [];

    frets.push(
      <select key={'S'}
        defaultValue={props.startNote}
        className="tuningSelect"
        onChange={(e) => {handleTuningSelect(e, props.snum)}}
      >
        <option value={"A"}>A</option>
        <option value={"A#"}>A#</option>
        <option value={"B"}>B</option>
        <option value={"C"}>C</option>
        <option value={"C#"}>C#</option>
        <option value={"D"}>D</option>
        <option value={"D#"}>D#</option>
        <option value={"E"}>E</option>
        <option value={"F"}>F</option>
        <option value={"F#"}>F#</option>
        <option value={"G"}>G</option>
        <option value={"G#"}>G#</option>
        
      </select>
    );

    let oct = props.startOctave;
    if (capoSetting >= 12) oct++

    // Counter for the "Display Note"
    let k = notes.indexOf(props.startNote);
    
    // Counter for the "True Note" (note + capo)
    let j = k

    if (capoSetting > 0) {
      j += capoSetting

      // If capo offset goes off fretboard, 
      while (j >= notes.length) {
        j = j % notes.length
      }
    }
    
    // For each fret up to 12, make a button
    for (let i = 0; i < 12; i++) {

      // If we loop back to C, up the octave.
      if (notes[j] == "C") oct++;

      frets.push(<Fret key={i} octave={oct} displayNote={notes[k]} note={notes[j]} stringNumber={props.snum} val={i}></Fret>);

      j = j + 1
      k = k + 1
      if (k >= notes.length) k = 0;
      if (j >= notes.length) j = 0;
    }

    // Add "X" button at end
    frets.push(<button key={'X'} className="noteClearBtn" onClick={() => writeNote(-1, props.snum)}>X</button>);

    return frets;
  };

  return (
    <div className="fretboard">
      <String startNote={props.tuning[5]} startOctave={4} snum={5}></String> <br></br>
      <String startNote={props.tuning[4]} startOctave={3} snum={4}></String> <br></br>
      <String startNote={props.tuning[3]} startOctave={3} snum={3}></String> <br></br>
      <String startNote={props.tuning[2]} startOctave={3} snum={2}></String> <br></br>
      <String startNote={props.tuning[1]} startOctave={2} snum={1}></String> <br></br>
      <String startNote={props.tuning[0]} startOctave={2} snum={0}></String> <br></br>
    </div>
  );
};

export default Fretboard;
