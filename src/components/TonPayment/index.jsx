import React, { useState, useEffect } from "react";
import { Button, Modal, Card, Typography, Space } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import { CHAIN } from "@tonconnect/protocol";
import TonConnect from "@tonconnect/sdk";
import "./styles.css";

const { Text, Title } = Typography;

const CREDIT_PACKAGES = [
  { credits: 100, price: 0.1 }, // 0.1 TON
  { credits: 500, price: 0.45 }, // 0.45 TON
  { credits: 1000, price: 0.8 }, // 0.8 TON
];

// Initialize TON Connect
const connector = new TonConnect({
  manifestUrl: "https://slot-game-bot.vercel.app/tonconnect-manifest.json",
  buttonRootId: "ton-connect-button",
});

const TonPayment = ({ onSuccess }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      const walletInfo = await connector.getWalletInfo();
      if (walletInfo) {
        setWalletAddress(walletInfo.account.address);
      }
    };

    checkConnection();

    // Subscribe to wallet events
    connector.onStatusChange((wallet) => {
      if (wallet) {
        setWalletAddress(wallet.account.address);
      } else {
        setWalletAddress(null);
      }
    });
  }, []);

  const connectWallet = async () => {
    try {
      // This will open the wallet selection modal
      await connector.connect();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handlePurchase = async (creditPackage, e) => {
    e.stopPropagation();

    if (!walletAddress) return;

    setIsLoading(true);
    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60 * 20,
        network: CHAIN.MAINNET,
        from: walletAddress,
        messages: [
          {
            address: "EQYour-Wallet-Address-Here",
            amount: BigInt(Math.floor(creditPackage.price * 1000000000)),
            stateInit: null,
            payload: null,
          },
        ],
      };

      const result = await connector.sendTransaction(transaction);

      if (result) {
        onSuccess(creditPackage.credits);
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    await connector.disconnect();
    setWalletAddress(null);
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
        {!walletAddress ? (
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
            <div className="wallet-info">
              <Text className="wallet-address">
                Connected: {walletAddress.slice(0, 6)}...
                {walletAddress.slice(-4)}
              </Text>
              <Button type="link" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </div>
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
