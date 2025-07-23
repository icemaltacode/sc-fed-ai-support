import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import MessageBubble from "./MessageBubble";
import { createAvatar } from "@dicebear/core";
import { adventurer, bottts } from "@dicebear/collection";

const Container = styled.div`
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 320px;
  max-height: 500px;
  background: #1e1e2f;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
`;

const Header = styled.div`
  background: #5b5fef;
  color: white;
  padding: 12px;
  font-weight: bold;
`;

const ChatArea = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const InputArea = styled.form`
  display: flex;
  padding: 8px;
  gap: 8px;
  background-color: #2a2a3d;
  border-top: 1px solid #3a3a4d;
`;

const Input = styled.textarea`
  flex: 1;
  resize: none;
  padding: 8px;
  border-radius: 6px;
  background-color: #1e1e2f;
  color: white;
  border: 1px solid #444;
`;

const Button = styled.button`
  background: #5b5fef;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
`;

const SuggestionButton = styled.button`
  padding: 6px 10px;
  border: 1px solid #5b5fef;
  background: transparent;
  color: #5b5fef;
  border-radius: 16px;
  font-size: 12px;
  margin: 4px;
  cursor: pointer;
  white-space: normal;
  max-width: 100%;
  overflow-wrap: break-word;
  word-break: break-word;
  text-align: left;
  animation: fadeInHighlight 1.2s ease-out;

  @keyframes fadeInHighlight {
    0% {
      background-color: rgba(91, 95, 239, 0.4);
      transform: scale(1.02);
    }
    100% {
      background-color: transparent;
      transform: scale(1);
    }
  }

  &:hover {
    background: rgba(91, 95, 239, 0.1);
  }
`;

const getAvatar = async (seed) => {
  if (seed === "ai") {
    const avatar = createAvatar(bottts, { seed: "Riley" });
    return "data:image/svg+xml;utf8," + encodeURIComponent(avatar.toString());
  }

  const avatar = createAvatar(adventurer, {
    seed: seed + Math.random().toString(36).substring(2, 8),
    size: 32,
    radius: 8,
  });
  return "data:image/svg+xml;utf8," + encodeURIComponent(avatar.toString());
};

function ChatWindow({ userName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  const [aiAvatar, setAiAvatar] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [suggestions, setSuggestions] = useState([
    "What does RoboClean Duo do?",
    "How long does the RoboClean Mini battery last?",
    "Which model is best for pet hair?",
    "Can the RoboClean Ultra map my rooms?",
  ]);

  useEffect(() => {
    getAvatar("ai").then(setAiAvatar);
    getAvatar(userName).then(setUserAvatar);
  }, [userName]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  useEffect(() => {
    if (suggestions.length > 0 && chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [suggestions]);

  const sendMessageToAI = async (message) => {
    const userMsg = { isUser: true, text: message, avatar: userAvatar };
    const aiMsg = { isUser: false, text: "", avatar: aiAvatar };

    setSuggestions([]);
    setMessages((prev) => [...prev, userMsg, aiMsg]);

    // Prepare OpenAI-style messages array
    const openaiMessages = [
      { role: "system", content: "You are a helpful assistant." },
      ...messages.map((msg) => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: message },
    ];

    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: openaiMessages }),
      });

      if (!response.ok || !response.body) throw new Error("Network error");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const parts = buffer
          .split("\n\n")
          .filter((line) => line.trim().startsWith("data: "));
        for (let part of parts) {
          const json = JSON.parse(part.replace("data: ", ""));
          const text = json.text || "";

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].text += text;
            return updated;
          });
        }

        buffer = "";
      }

      // After AI response is done, fetch new suggestions
      try {
        const suggestionRes = await fetch("http://localhost:3000/suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              ...[
                ...messages,
                userMsg,
                {
                  role: "assistant",
                  content: aiMsg.text,
                },
              ].map((msg) => ({
                role: msg.isUser ? "user" : msg.role || "assistant",
                content: msg.text || msg.content,
              })),
            ],
          }),
        });

        if (suggestionRes.ok) {
          const data = await suggestionRes.json();
          setSuggestions(data.suggestions || []);
        } else {
          console.warn("No suggestions returned");
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Suggestion fetch error:", err);
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = "[Error receiving response]";
        return updated;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessageToAI(input.trim());
      setInput("");
    }
  };

  return (
    <Container>
      <Header>Chat with AI</Header>
      <ChatArea ref={chatRef}>
        <div
          style={{
            textAlign: "center",
            color: "#888",
            fontSize: "12px",
            marginBottom: "8px",
          }}
        >
          You are chatting with an AI. AI can make mistakes.
        </div>
        {messages.map((msg, index) => (
          <MessageBubble key={index} {...msg} />
        ))}
        {suggestions.length > 0 && (
          <div
            style={{ display: "flex", flexWrap: "wrap", margin: "12px 0 0" }}
          >
            {suggestions.map((text, i) => (
              <SuggestionButton
                key={i}
                onClick={() => {
                  sendMessageToAI(text);
                  setSuggestions([]);
                }}
              >
                {text}
              </SuggestionButton>
            ))}
          </div>
        )}
      </ChatArea>
      <InputArea onSubmit={handleSubmit}>
        <Input
          rows="2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit">Send</Button>
      </InputArea>
    </Container>
  );
}

export default ChatWindow;
