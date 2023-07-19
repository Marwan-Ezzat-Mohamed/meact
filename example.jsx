import Meact from "./src";

function App() {
  const [counter, setCounter] = Meact.useState(1);

  return (
    <div style="display: flex; flex-direction: row;">
      <button
        onClick={() => {
          setCounter((old) => {
            // console.log("first");
            return old + 1;
          });
        }}
      >
        {counter}
      </button>
    </div>
  );
}

const element = <App />;
const container = document.getElementById("root");
Meact.render(element, container);
