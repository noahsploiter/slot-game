import React, { useState, useEffect, useRef } from "react";
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

const SlotReel = ({ spinning, finalSymbol, speed = 30 }) => {
  const [symbols, setSymbols] = useState([...SYMBOLS, ...SYMBOLS, ...SYMBOLS]);
  const [position, setPosition] = useState(0);
  const requestRef = useRef();

  useEffect(() => {
    if (spinning) {
      let currentPos = position;
      const animate = () => {
        currentPos += speed;
        if (currentPos >= symbols.length * 40) {
          currentPos = 0;
        }
        setPosition(currentPos);
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
    } else {
      // Smoothly transition to final position
      const targetPosition = finalSymbol * 40;
      const animate = () => {
        setPosition((prev) => {
          const newPos = prev + speed;
          if (newPos >= targetPosition) {
            cancelAnimationFrame(requestRef.current);
            return targetPosition;
          }
          requestRef.current = requestAnimationFrame(animate);
          return newPos;
        });
      };
      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [spinning, finalSymbol, speed]);

  return (
    <div className="reel-container">
      <div
        className="reel-symbols"
        style={{
          transform: `translateY(${-position}px)`,
        }}
      >
        {symbols.map((symbol, index) => (
          <div key={index} className="reel-symbol">
            {symbol.icon}
          </div>
        ))}
      </div>
    </div>
  );
};

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

  const triggerVibration = () => {
    // Access Telegram WebApp
    const tg = window.Telegram.WebApp;
    if (tg) {
      // Trigger light impact vibration
      tg.HapticFeedback.impactOccurred("light");
    }
  };

  const spin = () => {
    if (score < 10) return;
    setIsSpinning(true);
    setLastWin(0);
    triggerVibration();

    // Generate final results immediately but don't show them yet
    const finalSlots = slots.map(() =>
      Math.floor(Math.random() * SYMBOLS.length)
    );

    // Stop the reels one by one
    setTimeout(() => {
      setSlots((prev) => [finalSlots[0], prev[1], prev[2]]);
      triggerVibration();
    }, 1000);

    setTimeout(() => {
      setSlots((prev) => [prev[0], finalSlots[1], prev[2]]);
      triggerVibration();
    }, 1500);

    setTimeout(() => {
      setSlots((prev) => [prev[0], prev[1], finalSlots[2]]);
      setIsSpinning(false);
      checkWin(finalSlots);
      triggerVibration();
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
          <div className="slot-symbols">
            {slots.map((symbolIndex, index) => (
              <div key={index} className="symbol-container">
                <SlotReel
                  spinning={isSpinning}
                  finalSymbol={symbolIndex}
                  speed={30 + index * 5} // Slightly different speeds for each reel
                />
              </div>
            ))}
          </div>
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
