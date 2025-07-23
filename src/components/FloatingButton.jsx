import styled from "styled-components";

const Button = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  z-index: 1000;

  &:hover {
    background-color: #0056b3;
  }
`;

function FloatingButton({ onClick }) {
  return <Button onClick={onClick}>💬</Button>;
}

export default FloatingButton;
