import NavBar from "../components/navbar";
import { auth, db } from "../config/firebase";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  getDoc,
  collection,
  doc,
  updateDoc,
  DocumentData,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { render } from "react-dom";

const Profile = () => {
  const goto = useNavigate();

  const [usertracks, setUserTracks] = useState<React.ReactElement[]>([]);

  const usersRef = collection(db, "users");
  const tabsRef = collection(db, "tabs");

  const renderUserTracks = async () => {
    let elements: React.ReactElement[] = [];
    try {
      if (auth.currentUser) {
        const d = await getDoc(doc(usersRef, auth.currentUser.uid));
        const data = d.data();
        if (data) {
          data.saved.forEach((track_id: string) => {
            getDoc(doc(tabsRef, track_id)).then((doc: any) => {
              elements.push(
                <>
                  <button onClick={() => goto(`/view/${track_id}`)}>
                    "{doc.data().name}" by <i>{doc.data().author}</i>
                  </button>
                  <button onClick={() => remove(track_id)}> X </button>{" "}
                  <br></br>
                </>,
              );
            });
          });
        }
        setUserTracks([<li>Loading...</li>]);
        setTimeout(() => {
          setUserTracks(elements);
        }, 500);
      } else {
        setUserTracks([<li>Log in to view your saved tracks</li>]);
      }
    } catch (err) {
      console.error(err);
      setUserTracks([<li>An error occured getting saved tracks</li>]);
    }
  };

  const remove = async (tab_id: string) => {
    if (auth.currentUser) {
      const document = await getDoc(doc(usersRef, auth.currentUser.uid));
      const data = document.data();
      let newSaved = data?.saved;
      newSaved.splice(newSaved.indexOf(tab_id), 1);
      await updateDoc(doc(usersRef, auth.currentUser.uid), {
        saved: newSaved,
      }).then(() => renderUserTracks());
    }
  };

  const logout = async () => {
    try {
      await signOut(auth).then(() => {
        goto("/profile");
        setUserTracks([<li>Logged Out</li>]);
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    renderUserTracks();
  }, []);

  return (
    <>
      <NavBar></NavBar>
      <p>
        {auth.currentUser
          ? `Signed In: ${auth.currentUser.email}`
          : "Not Signed In."}
      </p>
      {!auth.currentUser ? (
        <Link to="/auth">
          <button>Click here to Log In</button>
        </Link>
      ) : (
        <button onClick={logout}>Log Out</button>
      )}
      <hr></hr>
      <p>Saved Tabs:</p>
      <ul>{usertracks.length != 0 ? usertracks : "No saved tracks"}</ul>
    </>
  );
};

export default Profile;
