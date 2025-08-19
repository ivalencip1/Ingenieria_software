import React, { useEffect, useState } from "react";
import MagBoost from './MagBoost.png';  //importamos imagen

function App() {
  const [backendMessage, setBackendMessage] = useState("");

  useEffect(() => {
    // Llamar al backend
    fetch("http://localhost:5000/api/hello")
      .then((res) => res.json())  
      .then((data) => setBackendMessage(data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <img src={MagBoost} alt="Logo MagBoost" style={{ width: "150px", marginBottom: "20px" }} />
      <h1>Hello World desde el Frontend de MagBoost</h1>
      <h2>Mensaje desde backend: {backendMessage}</h2>
    </div>
  );
}

export default App;
