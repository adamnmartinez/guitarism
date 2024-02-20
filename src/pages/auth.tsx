import { useState } from "react";
import NavBar from "../components/navbar";
import { auth, db, googleprovider } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const goto = useNavigate();

  const usersRef = collection(db, "users");

  const authenticate = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password).then(() => {
        goto("/profile");
      });
    } catch (err: any) {
      if (err.code == "auth/invalid-email") {
        setMessage("Please submit a valid email.");
      }
      if (err.code == "auth/invalid-credential") {
        setMessage("Sorry! Your email or password were incorrect.");
      }
    }
  };

  const authenticate_google = async () => {
    try {
      await signInWithPopup(auth, googleprovider).then(() => {
        goto("/profile");
      });
      // Create new user document for Google Account if it dosen't exist already
      if (auth.currentUser) {
        let uid = auth.currentUser.uid;
        const document = await getDoc(doc(usersRef, uid));
        // Check if Google User's doc dosen't exist.
        if (!document.exists()) {
          // Create new user doc
          await setDoc(doc(usersRef, uid), {
            saved: [],
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const register = async () => {
    if(email.length == 0 || password.length == 0) {
      setMessage('You need a non-empty email and password to register')
      return
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password).then(() => {
        goto("/profile");
      });
      setMessage("");
      // Create user document on registration with email/password.
      if (auth.currentUser) {
        let uid = auth.currentUser.uid;
        await setDoc(doc(usersRef, uid), {
          saved: [],
        });
      }
    } catch (err: any) {
      if (err.code == "auth/email-already-in-use") {
        setMessage("Sorry! That email is already in use.");
      } else {
        console.error(err);
        setMessage("Sorry! An unexpected error occured.");
      }
    }
  };

  return (
    <div>
      <NavBar></NavBar>
      <input
        placeholder="Email"
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      ></input>{" "}
      <br></br>
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      ></input>{" "}
      <br></br>
      <p>{message}</p>
      <button onClick={authenticate}>Sign in</button> |{" "}
      <button onClick={register}>Register</button> | <button onClick={authenticate_google}> Sign in with Google</button>
    </div>
  );
};

export default Auth;
