import React, { useState, useEffect } from "react";
import { Button, Row, Col, Space, Typography, Avatar } from "antd";
import {
  DollarOutlined,
  StarOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./styles.css";

const { Title, Text } = Typography;

const SYMBOLS = [
  { icon: <DollarOutlined style={{ color: "#FFD700" }} />, value: 1 },
  { icon: <StarOutlined style={{ color: "#FF4D4F" }} />, value: 2 },
  { icon: <ThunderboltOutlined style={{ color: "#1890FF" }} />, value: 3 },
];

const SlotMachine = () => {
  const [slots, setSlots] = useState([0, 0, 0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [score, setScore] = useState(1000);
  const [lastWin, setLastWin] = useState(0);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Access Telegram WebApp data
    const tg = window.Telegram.WebApp;

    if (tg) {
      tg.ready();
      // Get user data
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setUserData({
          name:
            user.username ||
            `${user.first_name} ${user.last_name || ""}`.trim(),
          photoUrl: user.photo_url,
        });
      }
    }
  }, []);

  const checkWin = (newSlots) => {
    if (newSlots[0] === newSlots[1] && newSlots[1] === newSlots[2]) {
      // All symbols match
      const winAmount = SYMBOLS[newSlots[0]].value * 100;
      setLastWin(winAmount);
      setScore((prev) => prev + winAmount);
      return;
    }
    // No match
    setLastWin(0);
    setScore((prev) => prev - 10); // Cost per spin
  };

  const spin = () => {
    if (score < 10) return; // Not enough credits
    setIsSpinning(true);
    setLastWin(0);

    // Simulate spinning animation
    const intervalId = setInterval(() => {
      setSlots(slots.map(() => Math.floor(Math.random() * SYMBOLS.length)));
    }, 100);

    // Stop after 2 seconds
    setTimeout(() => {
      clearInterval(intervalId);
      setIsSpinning(false);
      // Generate final result
      const finalSlots = slots.map(() =>
        Math.floor(Math.random() * SYMBOLS.length)
      );
      setSlots(finalSlots);
      checkWin(finalSlots);
    }, 2000);
  };

  return (
    <div className="slot-machine">
      {/* User Profile */}
      <div className="user-profile">
        {userData?.photoUrl ? (
          <Avatar size={40} src={userData.photoUrl} />
        ) : (
          <Avatar size={40} icon={<UserOutlined />} />
        )}
        <Text strong className="username">
          {userData?.name || "Player"}
        </Text>
      </div>

      {/* Score Display */}
      <div className="score-container">
        <div className="score-item">
          <TrophyOutlined className="score-icon" />
          <Text strong>Credits: {score}</Text>
        </div>
        {lastWin > 0 && (
          <div className="win-announcement">
            <Text strong className="win-text">
              WIN: {lastWin}!
            </Text>
          </div>
        )}
      </div>

      {/* Slot Machine Display */}
      <Row justify="center" className="slot-display">
        <Col span={24}>
          <Space size="large" className="slot-symbols">
            {slots.map((symbolIndex, index) => (
              <div
                key={index}
                className={`symbol-container ${isSpinning ? "spinning" : ""}`}
              >
                {SYMBOLS[symbolIndex].icon}
              </div>
            ))}
          </Space>
        </Col>
      </Row>

      {/* Spin Button */}
      <Row justify="center">
        <Button
          type="primary"
          size="large"
          onClick={spin}
          disabled={isSpinning || score < 10}
          className="spin-button"
        >
          {isSpinning ? "Spinning..." : "SPIN (10 credits)"}
        </Button>
      </Row>
    </div>
  );
};

export default SlotMachine;
