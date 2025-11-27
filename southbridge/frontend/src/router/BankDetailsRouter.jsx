import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BankDetailsPage from '../pages/BankDetails';
import BankAddPage from '../pages/BankAdd';
import BankWithdrawPage from '../pages/BankWithdraw';

const BankDetailsRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<BankDetailsPage />} />
            <Route path="/add" element={<BankAddPage />} />
            <Route path="/withdraw" element={<BankWithdrawPage />} />
        </Routes>
    );
};

export default BankDetailsRouter;
