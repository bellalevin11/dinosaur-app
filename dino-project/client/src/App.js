import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState("");

  useEffect(() => {
    fetch("http://localhost:5001/")
      .then(res => res.text())
      .then(data => setData(data));
  }, []);

  return <div>{data}</div>;
}

export default App;