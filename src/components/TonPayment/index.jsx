import React, { useState, useEffect } from "react";
import { Button, Modal, Card, Typography, Space } from "antd";
import { WalletOutlined, LoadingOutlined } from "@ant-design/icons";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useTonConnect } from "../../hooks/useTonConnect";
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
  const { connected, wallet, sendTransaction } = useTonConnect();

  const handlePurchase = async (creditPackage) => {
    if (!connected || !wallet) {
      return;
    }

    setIsLoading(true);
    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
        messages: [
          {
            address: "YOUR_WALLET_ADDRESS", // Replace with your wallet address
            amount: BigInt(creditPackage.price * 1000000000), // Convert to nanotons
          },
        ],
      };

      const result = await sendTransaction(transaction);

      if (result.success) {
        onSuccess(creditPackage.credits);
        setIsModalVisible(false);
      }
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
        title="Purchase Credits"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="ton-payment-modal"
      >
        <div className="ton-connect-container">
          <TonConnectButton />
        </div>

        {connected ? (
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
                      <Title level={4}>{pkg.credits} Credits</Title>
                      <Text>{pkg.price} TON</Text>
                    </div>
                    <Button
                      type="primary"
                      onClick={() => handlePurchase(pkg)}
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
        ) : (
          <div className="connect-prompt">
            <Text>Please connect your TON wallet to purchase credits</Text>
          </div>
        )}
      </Modal>
    </>
  );
};

export default TonPayment;
