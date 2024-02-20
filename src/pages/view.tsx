import { useLoaderData, useNavigate } from "react-router-dom";
import NavBar from "../components/navbar";
import { ReactElement, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";

const usersRef = collection(db, "users");
const tabsRef = collection(db, "tabs");

const View = () => {
  const goto = useNavigate();
  //@ts-ignore
  const tab_id: string = useLoaderData();
  const [tabData, setTabData] = useState(Object);
  const [columns, setColumns] = useState<ReactElement[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const renderTabs = async () => {
    //@ts-ignore
    let document = await getDoc(doc(tabsRef, tab_id));
    let data = document.data();
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
      const elements: any[] = [];
      data.tablature.forEach((col: any) => {
        elements.push(
          <button>
            {col.e2 >= 0 ? col.e2 : "-"}
            <br></br>
            {col.b >= 0 ? col.b : "-"}
            <br></br>
            {col.g >= 0 ? col.g : "-"}
            <br></br>
            {col.d >= 0 ? col.d : "-"}
            <br></br>
            {col.a >= 0 ? col.a : "-"}
            <br></br>
            {col.e1 >= 0 ? col.e1 : "-"}
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
    goto("/create");
  };

  const handleDelete = async (e: any) => {
    e.preventDefault();
    //@ts-ignore
    await deleteDoc(doc(tabsRef, tab_id))
    goto("/");

  };

  const handleListen = async (e: any) => {
    e.preventDefault()
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
    <>
      <NavBar></NavBar>
      <h2>"{tabData.name}" by <i>{tabData.author}</i></h2>
      <h3>BPM: {tabData.bpm}, Capo {tabData.capo > 0 ? tabData.capo : "None"}</h3>
      <br></br>
      <button
        onClick={isSaved ? (e) => remove(e, tab_id) : (e) => handleSave(e)}
      >
        {isSaved ? "Remove from Profile" : "Save to Profile"}
      </button>{" "}
      <button onClick={(e) => handleEdit(e)}>Copy tab to editor</button>{" "}
      <button onClick={(e) => handleListen(e)}>Listen {">"}</button>
      <hr></hr>
      {auth.currentUser ? (
        auth.currentUser.uid == tabData.author_id ? (
          <button onClick={(e) => handleDelete(e)} >Delete</button>
        ) : (
          ""
        )
      ) : (
        ""
      )}
      <hr></hr>
      {columns}
    </>
  );
};

export default View;
