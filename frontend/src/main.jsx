import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import ShopContextProvider from "./context/ShopContext.jsx";
import FavsContextProvider from "./context/FavsContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ShopContextProvider>
      <FavsContextProvider>
        <App />
      </FavsContextProvider>
    </ShopContextProvider>
  </BrowserRouter>
);
