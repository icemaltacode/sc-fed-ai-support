import { useState, useEffect } from "react";
import styled from "styled-components";
import FloatingButton from "./FloatingButton";
import ChatWindow from "./ChatWindow";

const NamePromptWrapper = styled.div`
  position: fixed;
  bottom: 90px;
  right: 20px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  z-index: 1000;
`;

const NameForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NameInput = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const SubmitButton = styled.button`
  padding: 8px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("chatName");
    if (stored) setName(stored);
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      localStorage.setItem("chatName", trimmed);
      setName(trimmed);
      setIsNameConfirmed(true); // this controls the transition
    }
  };

  return (
    <>
      {isOpen && !isNameConfirmed && (
        <NamePromptWrapper>
          <NameForm onSubmit={handleNameSubmit}>
            <p>Please enter your name to start:</p>
            <NameInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <SubmitButton type="submit">Start</SubmitButton>
          </NameForm>
        </NamePromptWrapper>
      )}

      {isOpen && isNameConfirmed && <ChatWindow userName={name} />}

      <FloatingButton onClick={() => setIsOpen((prev) => !prev)} />
    </>
  );
}

export default ChatWidget;
