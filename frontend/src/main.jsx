import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import ShopContextProvider from "./context/ShopContext.jsx";
import FavsContextProvider from "./context/FavsContext.jsx";
import UserContextProvider from "./context/UserContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ShopContextProvider>
      <FavsContextProvider>
        <UserContextProvider>
          <App />
        </UserContextProvider>
      </FavsContextProvider>
    </ShopContextProvider>
  </BrowserRouter>
);
