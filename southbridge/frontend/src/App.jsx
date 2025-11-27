import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import React, { useEffect } from "react";
import MainRouter from "./router/MainRouter";
import { ToastProvider } from "./components/Toast";
import WebSocketProvider from "./components/webSocketProvider";



const App = () => {
    useEffect(() => {
    
}, []);
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <ToastProvider>
                    <WebSocketProvider>
                        <MainRouter />
                    </WebSocketProvider>
                </ToastProvider>
            </PersistGate>
        </Provider>
    );
};

export default App;
