import { useLoaderData, useNavigate } from "react-router-dom";
import NavBar from "../components/navbar";
import { ReactElement, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { play, stopPlayback } from "../utilities.tsx/player";
import * as Tone from "tone";

const usersRef = collection(db, "users");
const tabsRef = collection(db, "tabs");

const View = () => {
  const goto = useNavigate();
  //@ts-ignore
  const tab_id: string = useLoaderData();
  const [tabData, setTabData] = useState(Object);
  const [columns, setColumns] = useState<ReactElement[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [playing, setPlaying] = useState(false)
  const [tab, setTab] = useState<number[][]>([])

  const renderTabs = async () => {
    //@ts-ignore
    let document = await getDoc(doc(tabsRef, tab_id));
    let data = document.data();

    console.log(data)

    if (data) {
      if (auth.currentUser) {
        let document = await getDoc(doc(usersRef, auth.currentUser.uid));
        let data = document.data();
        if (data) {
          if (data.saved.includes(tab_id)) {
            setIsSaved(true);
          }
        }
      }

      setTabData(data);
      
      let saved_tab = data.tablature
      let unpacked = []
      for (let i = 0; i < saved_tab.length; i += 6) {
        unpacked.push(saved_tab.slice(i, i + 6))
      }

      setTab(unpacked)

      const elements: any[] = [];
      unpacked.forEach((col: any) => {
        elements.push(
          <button className="tablature">
            {col[5] >= 0 ? col[5] : "-"}
            <br></br>
            {col[4] >= 0 ? col[4] : "-"}
            <br></br>
            {col[3] >= 0 ? col[3] : "-"}
            <br></br>
            {col[2] >= 0 ? col[2] : "-"}
            <br></br>
            {col[1] >= 0 ? col[1] : "-"}
            <br></br>
            {col[0] >= 0 ? col[0] : "-"}
            <br></br>
          </button>,
        );
      });
      setColumns(elements);
    }
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    // If user is authenticated
    if (auth.currentUser) {
      // Get authenticated user document
      let document = await getDoc(doc(usersRef, auth.currentUser.uid));
      let data = document.data();
      // Get saved tabs list
      let saved = data ? data.saved : [];
      // Push new tab
      saved.push(tab_id);
      // Update
      await updateDoc(doc(usersRef, auth.currentUser.uid), {
        saved: saved,
      }).then(() => {
        renderTabs();
        setIsSaved(true);
      });
    } else {
      // If user isn't authenticated send them to log in page.
      goto("/auth");
    }
  };

  const handleEdit = async (e: any) => {
    e.preventDefault();
    //@ts-ignore
    let document = await getDoc(doc(tabsRef, tab_id));
    let data = document.data();
    localStorage.setItem("savedTab", JSON.stringify(data));
    stopPlayback()
    goto("/create");
  };

  const handleDelete = async (e: any) => {
    e.preventDefault();
    //@ts-ignore
    await deleteDoc(doc(tabsRef, tab_id))
    stopPlayback()
    goto("/");

  };

  const handleListen = async (e: any) => {
    e.preventDefault()
    //console.log(tabData.tablature, tabData.bpm)
    setPlaying(true); // Disable play button temporarily
    let k = play(tabData.tuning, parseInt(tabData.capo), tab, tabData.bpm)
    setTimeout(() => {
      setPlaying(false); // Enable play button
    }, k * 1000);
  }

  const handleStopMusic = async (e: any) => {
    e.preventDefault()
    setPlaying(false)
    stopPlayback()
  }

  const remove = async (e: any, tab_id: string) => {
    e.preventDefault();
    if (auth.currentUser) {
      const document = await getDoc(doc(usersRef, auth.currentUser.uid));
      const data = document.data();
      let newSaved = data?.saved;
      newSaved.splice(newSaved.indexOf(tab_id), 1);
      await updateDoc(doc(usersRef, auth.currentUser.uid), {
        saved: newSaved,
      }).then(() => {
        renderTabs();
        setIsSaved(false);
      });
    }
  };

  useEffect(() => {
    renderTabs();
  }, []);

  return (
    <div className="view">
      <NavBar></NavBar>
      <h2>"{tabData.name}" uploaded by <i>{tabData.author}</i></h2>
      <h3>BPM: {tabData.bpm}, Capo {tabData.capo > 0 ? tabData.capo : "None"}</h3>
      <h4>Tuning: {""}
        {tabData.tuning}
      </h4>
      <br></br>
      <div className="utilBtn">
        <button
          onClick={isSaved ? (e) => remove(e, tab_id) : (e) => handleSave(e)}
        >
          {isSaved ? "Remove from Profile" : "Save to Profile"}
        </button>{" "}
        <button onClick={(e) => handleEdit(e)}>Copy tab to editor</button>{" "}
        <button className={playing ? "stopBtn" : "playBtn"} onClick={async (e) => {
          if (playing) {
            handleStopMusic(e)
          } else {
            await Tone.start()
            handleListen(e)
          }
        }}>
          {playing ? "Stop" : "Listen"}
        </button>
      </div>
      <br></br>
      {auth.currentUser ? (
        auth.currentUser.uid == tabData.author_id ? (
          <button className="deleteBtn" onClick={(e) => handleDelete(e)} >Delete Tab</button>
        ) : (
          ""
        )
      ) : (
        ""
      )}
      <br></br>
      <div className="columns">{columns}</div>
    </div>
  );
};

export default View;
