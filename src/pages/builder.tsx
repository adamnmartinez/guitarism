import NavBar from "../components/navbar";
import Fretboard from "../components/fretboard";
import { useEffect, useState, ReactElement, ChangeEvent } from "react";
import * as Tone from "tone";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

const synth = new Tone.PolySynth(Tone.Synth).toDestination();

const Builder = () => {
  let empty_tab = [
    {
      e2: -1,
      b: -1,
      g: -1,
      d: -1,
      a: -1,
      e1: -1,
    },
  ];
  let saved = localStorage.getItem("savedTab");
  const [selectedTab, setSelectedTab] = useState(0); //set tab -1 when deselected
  const [columns, setColumns] = useState<ReactElement[]>([]);
  const [BPM, setBPM] = useState(!saved ? 120 : JSON.parse(saved).bpm);
  const [name, setName] = useState(!saved ? "" : JSON.parse(saved).name);
  const [capo, setCapo] = useState(!saved ? 0 : JSON.parse(saved).capo);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState(
    !saved ? empty_tab : JSON.parse(saved).tablature,
  );

  const goto = useNavigate();
  const tabsRef = collection(db, "tabs");
  const usersRef = collection(db, "users");

  const writeToTab = async (val: number, string: string) => {
    let t = tab;
    let newTab = t[selectedTab];
    switch (string) {
      case "e":
        newTab.e2 = val;
        break;
      case "B":
        newTab.b = val;
        break;
      case "G":
        newTab.g = val;
        break;
      case "D":
        newTab.d = val;
        break;
      case "A":
        newTab.a = val;
        break;
      case "E":
        newTab.e1 = val;
        break;
      default:
        break;
    }
    setTab(t);
    // If last tab is selected, make a new column when a note is input
    if (selectedTab == tab.length - 1 && val >= 0) addTabColumn();

    // When tab is updated, save it to localStorage
    // localStorage.setItem('savedTab', JSON.stringify(tab))
    saveTab();

    //Debug
    console.log(tab);
  };

  const renderTabs = async () => {
    let cols = [];
    for (let i = 0; i < tab.length; i++) {
      cols.push(
        <button onClick={() => selectTab(i)}>
          {tab[i].e2 >= 0 ? tab[i].e2 : "-"}
          <br></br>
          {tab[i].b >= 0 ? tab[i].b : "-"}
          <br></br>
          {tab[i].g >= 0 ? tab[i].g : "-"}
          <br></br>
          {tab[i].d >= 0 ? tab[i].d : "-"}
          <br></br>
          {tab[i].a >= 0 ? tab[i].a : "-"}
          <br></br>
          {tab[i].e1 >= 0 ? tab[i].e1 : "-"}
          <br></br>
        </button>,
      );
    }
    setColumns(cols);
  };

  const selectTab = async (i: number) => {
    setSelectedTab(i);
  };

  const addTabColumn = async () => {
    let newTab = tab;
    let newColumn = {
      e2: -1,
      b: -1,
      g: -1,
      d: -1,
      a: -1,
      e1: -1,
    };
    newTab.push(newColumn);
    setTab(newTab);
    selectTab(newTab.indexOf(newColumn));
    renderTabs();
    saveTab();
  };

  const delTabColumn = async () => {
    if (selectedTab == -1) return;
    if (tab.length == 1) return;
    let newTab = tab;
    let c_index = selectedTab;
    newTab.splice(c_index, 1);
    setTab(newTab);
    selectTab(-1);
    renderTabs();
    saveTab();
  };

  const clear = async () => {
    setTab(empty_tab);
    selectTab(0);
    saveTab();
    renderTabs();
  };

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

  const playTabAudio = () => {
    let series: string[][] = [];

    for (let i = 0; i < tab.length; i++) {
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
    setPlaying(true); // Disable play button temporarily
    let k = 0;
    for (let col = 0; col < series.length; col++) {
      for (let n = 0; n < series[col].length; n++) {
        synth.triggerAttackRelease(series[col][n], "16n", Tone.now() + k);
      }
      k += 60 / BPM;
    }
    setTimeout(() => {
      setPlaying(false); // Enable play button
    }, k * 1000);
  };

  const handleBPM = (e: ChangeEvent) => {
    e.preventDefault();
    const target = e.target as HTMLInputElement;
    if (target === null) {
      return;
    }
    if (target) setBPM(parseInt(target.value));
    saveTab();
  };

  const handleName = (e: ChangeEvent) => {
    e.preventDefault();
    const target = e.target as HTMLInputElement;
    if (target === null) {
      return;
    }
    if (target) setName(target.value);
    saveTab();
  };

  const handleCapo = (e: ChangeEvent) => {
    e.preventDefault();
    const target = e.target as HTMLInputElement;
    if (target === null) {
      return;
    }
    if (target) setCapo(target.value);
    saveTab();
  };

  const handleFileUpload = (event: any) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          setName(parsed.name);
          setBPM(parsed.bpm);
          setCapo(parsed.capo);
          setTab(parsed.tablature);
        } catch (error) {
          console.error(error);
        }
      };
      reader.readAsText(file);
      renderTabs();
    }
  };

  const handlePost = async (event: any) => {
    event.preventDefault();
    // If user is authenticated
    if (auth.currentUser) {
      // Create a document for this tab and assign a unique ID
      let tabID = uuid();

      await setDoc(doc(tabsRef, tabID), saveTab());

      // Get authenticated user document and update saved tabs
      let document = await getDoc(doc(usersRef, auth.currentUser.uid));
      let data = document.data();
      let saved = data ? data.saved : [];
      saved.push(tabID);

      await updateDoc(doc(usersRef, auth.currentUser.uid), {
        saved: saved,
      });
    } else {
      // If user isn't authenticated send them to log in page.
      goto("/auth");
    }
  };

  const saveTab = () => {
    let data = {
      name: name,
      author: auth.currentUser ? auth.currentUser.displayName : "Unknown",
      bpm: BPM,
      capo: capo,
      tablature: tab,
    };
    localStorage.setItem("savedTab", JSON.stringify(data));
    return data;
  };

  useEffect(() => {
    if (saved) selectTab(tab.length - 1);
    renderTabs();
  }, []);

  return (
    <>
      <NavBar></NavBar>
      Tablature in the editor is automatically cached into local web storage.
      <br></br>
      <button>
        <a
          href={`data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(saveTab()),
          )}`}
          download="tab.json"
        >
          {`Download`}
        </a>
      </button>
      <button
        onClick={(e) => {
          handlePost(e);
        }}
      >
        Post
      </button>
      <button>
        Upload |{" "}
        <input type="file" onChange={(e) => handleFileUpload(e)}></input>
      </button>
      <hr></hr>
      {columns}
      <hr></hr>
      Tab Name=
      <input
        onChange={(e) => {
          handleName(e);
        }}
        placeholder="Name"
        defaultValue={name}
      ></input>
      Capo=
      <input
        onChange={(e) => {
          handleCapo(e);
        }}
        type="number"
        placeholder="Capo"
        defaultValue={capo}
      ></input>
      BPM=
      <input
        placeholder="BPM"
        type="number"
        onChange={(e) => {
          handleBPM(e);
        }}
        defaultValue={BPM}
      ></input>
      {/* Tuning=
            <input placeholder="Tuning" defaultValue={'EADGBe'}></input> */}
      <br></br>
      <button onClick={() => addTabColumn()}>Add Space</button>
      <button onClick={() => delTabColumn()}>Delete Column</button>
      <button onClick={() => clear()}>Clear</button>
      <button disabled={playing} onClick={() => playTabAudio()}>
        {playing ? "Playing" : "Listen >"}
      </button>
      <hr></hr>
      <Fretboard write={writeToTab} renderTabs={renderTabs}></Fretboard>
    </>
  );
};

export default Builder;
