import { useTonConnectUI } from "@tonconnect/ui-react";
import { useEffect, useState } from "react";

export const useTonConnect = () => {
  const [tonConnectUI] = useTonConnectUI();
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const updateState = () => {
      setConnected(tonConnectUI.connected);
      setWallet(tonConnectUI.account);
    };

    updateState();
    tonConnectUI.onStatusChange(updateState);
  }, [tonConnectUI]);

  const sendTransaction = async (transaction) => {
    if (!connected || !wallet) {
      throw new Error("Wallet not connected");
    }

    return tonConnectUI.sendTransaction(transaction);
  };

  return {
    connected,
    wallet,
    sendTransaction,
  };
};

// Or you can use default export if you prefer
// export default useTonConnect;
