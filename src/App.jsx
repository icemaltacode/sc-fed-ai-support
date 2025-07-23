import React from "react";
import ChatWidget from "./components/ChatWidget";

function App() {
  return (
    <>
      <h1 style={{ padding: "2rem" }}>Sample Page</h1>
      <p style={{ padding: "0 2rem" }}>
        This is a sample page. The AI-powered chat widget should appear at the bottom-right.
      </p>
      <ChatWidget />
    </>
  );
}

export default App;
