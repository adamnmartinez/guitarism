import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <>
      <h1>Guitarism</h1>
      <p>by <a href="https://github.com/adamnmartinez">Adam Martinez</a></p>
      <hr></hr>
      <Link to="/">
        <button>Home</button>
      </Link>
      <Link to="/create">
        <button>Create +</button>
      </Link>
      <Link to="/auth">
        <button>Log In</button>
      </Link>
      <Link to="/profile">
        <button>Profile</button>
      </Link>
      <hr></hr>
    </>
  );
};

export default NavBar;
