import * as Tone from "tone";
//@ts-ignore
import GuitarAcousticMp3 from 'tonejs-instrument-guitar-acoustic-mp3';

const synth = new GuitarAcousticMp3().toDestination();
const notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

const Fretboard = (props: any) => {
  const writeNote = (val: number, s: string) => {
    props.write(val, s);
    props.renderTabs();
  };

  const Fret = (props: any) => {
    return (
      <button
        onClick={() => {
          // Log fret data
          console.log(
            props.note + props.octave,
            `[${props.string}]`,
            `- ${props.val}`,
          );
          // Play Sound
          synth.triggerAttackRelease(
            props.note + props.octave,
            "4n",
            Tone.now(),
          );
          // Write Note to Tab
          writeNote(props.val, props.string);
        }}
        className="note"
      >
        {props.note}
      </button>
    );
  };

  const String = (props: any) => {
    const frets: any[] = [];
    let oct = props.octave;
    let k = notes.indexOf(props.startNote);
    let s =
      props.startNote != "E" ? props.startNote : props.octave == 4 ? "e" : "E";
    for (let i = 0; i < 13; i++) {
      if (notes[k] == "C") oct++;
      frets.push(<Fret octave={oct} note={notes[k]} string={s} val={i}></Fret>);
      k++;
      if (k > 11) k = 0;
    }
    frets.push(<button onClick={() => writeNote(-1, s)}>X</button>);
    return frets;
  };

  return (
    <>
      <String startNote="E" octave="4"></String> <br></br>
      <String startNote="B" octave="3"></String> <br></br>
      <String startNote="G" octave="3"></String> <br></br>
      <String startNote="D" octave="3"></String> <br></br>
      <String startNote="A" octave="2"></String> <br></br>
      <String startNote="E" octave="2"></String> <br></br>
    </>
  );
};

export default Fretboard;
