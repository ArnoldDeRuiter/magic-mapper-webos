import { render } from "@solidjs/web";
import App from "./App";
import "../css/app.css";

const root = document.getElementById("root");

if (!root) throw new Error("Magic Mapper could not find its application root");

render(() => <App />, root);
