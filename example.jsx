import Meact from "./index.js";
import "./example.css";

function App() {
  const [counter, setCounter] = Meact.useState(1);
  const [name, setName] = Meact.useState("");

  return (
    <div className="App">
      <h1>Meact</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onInput={(e) => {
          setName(() => {
            return e.target.value;
          });
        }}
      />
      <h2>Hello {name}</h2>
      <div>
        <button
          onClick={() => {
            setCounter((old) => {
              // console.log("first");
              return old + 1;
            });
          }}
        >
          You clicked {counter} times
        </button>
        <div className="items">
          {[1, 2, 3].map((item) => {
            return (
              <div key={item}>
                <h2>Item: {item}</h2>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const element = <App />;
const container = document.getElementById("root");
Meact.render(element, container);
