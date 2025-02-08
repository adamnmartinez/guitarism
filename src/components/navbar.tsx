import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <div className="navigation">
      <h1>Guitarism</h1>
      <p>by <a href="https://github.com/adamnmartinez">Adam Martinez</a></p>
      <Link to="/">
        <button className="home">Home</button>
      </Link>
      <Link to="/create">
        <button className="create" name="create">Create +</button>
      </Link>
      <Link to="/auth">
        <button className="login">Log In</button>
      </Link>
      <Link to="/profile">
        <button className="profile">Profile</button>
      </Link>
      <br></br>
    </div>
  );
};

export default NavBar;
