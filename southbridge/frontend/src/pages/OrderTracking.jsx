import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TrackOrder from '../components/tracking/TrackOrder';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <TrackOrder orderId={parseInt(orderId)} onClose={handleClose} />
    </div>
  );
};

export default OrderTracking;

