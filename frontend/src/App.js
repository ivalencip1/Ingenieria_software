import React, { useEffect, useState } from "react";

function App() {
  const [backendMessage, setBackendMessage] = useState("");

  useEffect(() => {
    // Llamar al backend
    fetch("http://localhost:5000/api/hello")
      .then((res) => res.json())  //desde el back lo mandamos en formato tipo json y se recibe de igual manera
      .then((data) => setBackendMessage(data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Hola Mundo desde el Frontend</h1>
      <h2>Mensaje desde backend: {backendMessage}</h2>
    </div>
  );
}

export default App;
