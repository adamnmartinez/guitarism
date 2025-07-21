import { Link } from "react-router-dom";
import { stopPlayback } from "../utilities.tsx/player";

const NavBar = () => {
  const handleNavigate = () => {
    stopPlayback()
  }


  return (
    <div className="navigation">
      <div className="title">
        <p><i>Welcome to...</i></p>
        <h1>Guitarism</h1>
        <p>by <i><a href="https://github.com/adamnmartinez">Adam Martinez</a></i>.</p>
      </div>
      
      <Link to="/">
        <button className="home" onClick={handleNavigate}>Home</button>
      </Link>
      <Link to="/create">
        <button className="create" name="create" onClick={handleNavigate}>Create +</button>
      </Link>
      <Link to="/auth">
        <button className="login" onClick={handleNavigate}>Log In</button>
      </Link>
      <Link to="/profile">
        <button className="profile" onClick={handleNavigate}>Profile</button>
      </Link>
      <br></br>
    </div>
  );
};

export default NavBar;
