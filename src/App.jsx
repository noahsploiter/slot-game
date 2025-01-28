import React from "react";
import GamePage from "./pages/GamePage";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

const App = () => {
  return (
    <TonConnectUIProvider manifestUrl="https://your-app-url.com/tonconnect-manifest.json">
      <GamePage />
    </TonConnectUIProvider>
  );
};

export default App;
