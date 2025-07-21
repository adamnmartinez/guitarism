import NavBar from "../components/navbar";
import Fretboard from "../components/fretboard";
import { useEffect, useState, ReactElement, ChangeEvent } from "react";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { play, stopPlayback } from "../utilities.tsx/player"

const Builder = () => {
  const empty_tab = [-1, -1, -1, -1, -1, -1];
  const defaultTuning = ["E", "A", "D", "G", "B", "E"]
  let saved = localStorage.getItem("savedTab");
  const [selectedTab, setSelectedTab] = useState(0); //set tab -1 when deselected
  const [columns, setColumns] = useState<ReactElement[]>([]);
  const [BPM, setBPM] = useState(!saved ? 120 : JSON.parse(saved).bpm);
  const [name, setName] = useState(!saved ? "" : JSON.parse(saved).name);
  const [capo, setCapo] = useState(!saved ? 0 : JSON.parse(saved).capo);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState(
    !saved ? [ empty_tab ] : JSON.parse(saved).tablature,
  );
  const [tuning, setTuning] = useState(!saved ? defaultTuning : JSON.parse(saved).tuning)
  const goto = useNavigate();
  const tabsRef = collection(db, "tabs");
  const usersRef = collection(db, "users");

  const writeToTab = async (val: number, stringNumber: number) => {
    let t = tab;
    let selectedColumn = t[selectedTab];
    selectedColumn[stringNumber] = val

    setTab(t);

    // If last tab is selected, make a new column when a note is input
    if (selectedTab == tab.length - 1 && val >= 0) addTabColumn();

    // When tab is updated, save it to localStorage
    saveTab();    
  };

  const handleTuning = (val: string, snum: number) => {
    let newTuning = tuning
    newTuning[snum] = val
    setTuning(newTuning)
    saveTab()
    goto("/create")
  }

  const renderTabs = async () => {
    let cols = [];
    for (let i = 0; i < tab.length; i++) {
      cols.push(
        <button className="tabColumn" onClick={() => selectTab(i)} key={i}>
          {tab[i][5] >= 0 ? tab[i][5]: "-"}
          <br></br>
          {tab[i][4] >= 0 ? tab[i][4] : "-"}
          <br></br>
          {tab[i][3] >= 0 ? tab[i][3] : "-"}
          <br></br>
          {tab[i][2] >= 0 ? tab[i][2] : "-"}
          <br></br>
          {tab[i][1] >= 0 ? tab[i][1] : "-"}
          <br></br>
          {tab[i][0] >= 0 ? tab[i][0] : "-"}
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
    let newColumn = [-1, -1, -1, -1, -1, -1]
    newTab.push(newColumn);
    saveTab();
    setTab(newTab);
    selectTab(newTab.indexOf(newColumn));
    await renderTabs();
    
  };

  const delTabColumn = async () => {
    if (selectedTab == -1) return;
    if (tab.length == 1) return;
    let newTab = tab;
    let c_index = selectedTab;
    newTab.splice(c_index, 1);
    setTab(newTab);
    selectTab(-1);
    await renderTabs();
    saveTab();
  };

  const clear = async () => {
    setTab([empty_tab]);
    selectTab(0);
    await renderTabs();
    saveTab()
  };

  const playTabAudio = () => {
    setPlaying(true); // Disable play button temporarily
    let k = play(tuning, parseInt(capo), tab, BPM)
    setTimeout(() => {
      setPlaying(false); // Enable play button
    }, k * 1000);
  };

  const stopTabAudio = () => {
    setPlaying(false)
    stopPlayback()
  }

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
        } finally {
          saveTab()
          goto("/create")
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

      await setDoc(doc(tabsRef, tabID), saveTab()).then(() => goto(`/view/${tabID}`))

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
      author_id: auth.currentUser ? auth.currentUser.uid : "Unknown",
      bpm: BPM,
      capo: capo,
      tablature: tab,
      tuning: tuning,
    };
    localStorage.setItem("savedTab", JSON.stringify(data));
    return data;
  };

  useEffect(() => {
    if (saved) selectTab(tab.length - 1);
    renderTabs();
  }, [tab]);

  return (
    <div className="builder">
      <NavBar></NavBar>
      <h1>Welcome to the tab builder!</h1>
      <h3>Work in the editor is automatically saved</h3>
      <br></br>
      <div className="shareBlock">
        <h3>SHARE</h3>
        <button
          className="shareUtilBtn postBtn"
          onClick={(e) => {
            handlePost(e);
          }}
        >
          Post to Guitarism
        </button>
        <button>
          <a
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(saveTab()),
            )}`}
            download={`${name}.json`}
            className="shareUtilBtn exportBtn"
          >
            {`Download JSON`}
          </a>
        </button>
        <button className="shareUtilBtn importBtn">
          From JSON: {" "}
          <input type="file" onChange={(e) => handleFileUpload(e)}></input>
        </button>
        
      </div>
      <br></br>
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
        min={0}
        max={12}
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
      <br></br>
      <button className="builderUtilBtn" onClick={() => addTabColumn()}>Add Space</button>
      <button className="builderUtilBtn" onClick={() => delTabColumn()}>Delete Column</button>
      <button className="builderUtilBtn" onClick={() => clear()}>Clear</button>
      <button className="builderUtilBtn" onClick={() => setTuning(defaultTuning)}>Reset Tuning</button>
      <button className={playing ? "builderUtilBtn playing" : "builderUtilBtn"} onClick={() => playing ? stopTabAudio() : playTabAudio()}>
        {playing ? "Stop" : "Listen"}
      </button>
      <hr></hr>
      <Fretboard capo={parseInt(capo)} handleTuning={handleTuning} tuning={tuning} write={writeToTab} renderTabs={renderTabs}></Fretboard>
    </div>
  );
};

export default Builder;