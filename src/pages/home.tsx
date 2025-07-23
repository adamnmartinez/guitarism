import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  startAt,
  endAt,
} from "firebase/firestore";
import NavBar from "../components/navbar";
import { useNavigate } from "react-router-dom";

const searchPhrases = [
  "What's on your mind?",
  "Ask and you shall receive...",
  "Find your favorite songs!",
  "I'm all ears!"
]

const tabsRef = collection(db, "tabs");

function Home() {
  const [results, setResults] = useState<ReactElement[]>([]);
  const [phrase, setPhrase] = useState<string>("");
  const goto = useNavigate();

  async function search(e?: ChangeEvent) {
    let q: any;
    if (e) {
      const target = e.target as HTMLInputElement;
      const input = target.value;
      let empty = target.value.length <= 0 ? true : false;
      q = empty
        ? query(tabsRef, orderBy("name"))
        : query(
            tabsRef,
            orderBy("name"),
            startAt(input),
            endAt(input + "\uf8ff"),
          );
    } else {
      q = query(tabsRef, orderBy("name"));
    }
    const discovered: ReactElement[] = [];
    let documents = await getDocs(q);
    documents.forEach((d) => {
      let tab: any = d.data();
      const component = (
        <li>
          <button className="tabList" onClick={() => goto(`/view/${d.id}`)}>
            <p>
              "{tab.name}" by <i>{tab.author}</i>
            </p>
          </button>
        </li>
      );
      discovered.push(component);
    });
    setResults(discovered);
  }

  useEffect(() => {
    search();
    setPhrase(searchPhrases[Math.floor(Math.random() * searchPhrases.length)]);
  }, []);

  return (
    <div className="home">
      <NavBar></NavBar>
      <form>
        <input className="searchBar" placeholder={phrase} type="text" onChange={search}></input>
      </form>
      <ul className="trackList">{results}</ul>
    </div>
  );
}

export default Home;
