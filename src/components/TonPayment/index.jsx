import React, { useState, useEffect } from "react";
import { Button, Modal, Card, Typography, Space } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import "./styles.css";

const { Text, Title } = Typography;

const CREDIT_PACKAGES = [
  { credits: 100, price: 0.1 }, // 0.1 TON
  { credits: 500, price: 0.45 }, // 0.45 TON
  { credits: 1000, price: 0.8 }, // 0.8 TON
];

const TonPayment = ({ onSuccess }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    const tg = window.Telegram.WebApp;

    try {
      // Send connect request to the bot
      tg.sendData(
        JSON.stringify({
          action: "connect_wallet",
        })
      );

      // In a real implementation, you would wait for the bot's response
      // For now, we'll simulate a successful connection
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handlePurchase = async (creditPackage, e) => {
    e.stopPropagation();

    if (!isConnected) {
      return;
    }

    setIsLoading(true);
    const tg = window.Telegram.WebApp;

    try {
      // Send purchase request to the bot
      tg.sendData(
        JSON.stringify({
          action: "purchase_credits",
          package: {
            credits: creditPackage.credits,
            price: creditPackage.price,
          },
        })
      );

      // Handle success
      onSuccess(creditPackage.credits);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<WalletOutlined />}
        onClick={() => setIsModalVisible(true)}
        className="deposit-button"
      >
        Buy Credits
      </Button>

      <Modal
        title={<span className="modal-title">Purchase Credits</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="ton-payment-modal"
        maskClosable={false}
      >
        {!isConnected ? (
          <div className="connect-prompt">
            <Text className="connect-text">
              Please connect your TON wallet to purchase credits
            </Text>
            <Button
              type="primary"
              size="large"
              onClick={connectWallet}
              className="connect-wallet-button"
            >
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div className="packages-container">
            <Space direction="vertical" style={{ width: "100%" }}>
              {CREDIT_PACKAGES.map((pkg, index) => (
                <Card
                  key={index}
                  className={`package-card ${
                    selectedPackage === pkg ? "selected" : ""
                  }`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <div className="package-content">
                    <div>
                      <Title level={4} className="package-title">
                        {pkg.credits} Credits
                      </Title>
                      <Text className="package-price">{pkg.price} TON</Text>
                    </div>
                    <Button
                      type="primary"
                      onClick={(e) => handlePurchase(pkg, e)}
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      Purchase
                    </Button>
                  </div>
                </Card>
              ))}
            </Space>
          </div>
        )}
      </Modal>
    </>
  );
};

export default TonPayment;
