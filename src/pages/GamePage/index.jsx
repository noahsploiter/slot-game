import React from "react";
import SlotMachine from "../../components/SlotMachine";
import "./styles.css";

const GamePage = () => {
  return (
    <div className="game-page">
      <div className="game-container">
        <h1 className="game-title">Telegram Slot Game</h1>
        <SlotMachine />
      </div>
    </div>
  );
};

export default GamePage;
