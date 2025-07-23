import styled from "styled-components";
import ReactMarkdown from "react-markdown";

const Bubble = styled.div`
  background: ${props => (props.$isUser ? "#1e88e5" : "#2a2a2a")};
  color: ${props => (props.$isUser ? "#ffffff" : "#e0e0e0")};
  padding: 10px 14px;
  border-radius: 18px;
  max-width: 80%;
  margin: 4px 0;
  align-self: ${props => (props.$isUser ? "flex-end" : "flex-start")};
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  gap: 8px;
  flex-direction: ${props => (props.$isUser ? "row-reverse" : "row")};
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

const Text = styled.div`
  white-space: pre-wrap;
  color: ${props => (props.$isUser ? "#ffffff" : "#e0e0e0")};
`;

function MessageBubble({ isUser, avatar, text }) {
  return (
    <Bubble $isUser={isUser}>
      {avatar && <Avatar src={avatar} alt={isUser ? "User" : "AI"} />}
      <Text $isUser={isUser}>
        <ReactMarkdown>{text}</ReactMarkdown>
      </Text>
    </Bubble>
  );
}

export default MessageBubble;
