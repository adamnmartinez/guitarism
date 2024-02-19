import {
  BrowserRouter as Router,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./style/App.css";
import Auth from "./pages/auth.tsx";
import Home from "./pages/home.tsx";
import Profile from "./pages/profile.tsx";
import Builder from "./pages/builder.tsx";
import View from "./pages/view.tsx";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "auth",
      element: <Auth />,
    },
    {
      path: "profile",
      element: <Profile />,
    },
    {
      path: "create",
      element: <Builder />,
    },
    {
      path: "view/:tab_id",
      element: <View />,
      loader: async ({ params }) => {
        return params.tab_id;
      },
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
