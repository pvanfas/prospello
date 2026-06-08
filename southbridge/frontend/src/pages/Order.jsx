import React from 'react'
import { useSelector } from 'react-redux'
import DriverOrder from '../components/Order/DriverOrder'
import ShipperOrder from '../components/Order/ShipperOrder'
import useAuth from '../hooks/useAuth'

const Order = () => {
    const {user} = useAuth()
    console.log('====================================');
    console.log(user);
    console.log('====================================');
    const getComponent = () => {
        if(user?.role === "driver") {
            return <DriverOrder />
        } else if(user?.role === "shipper" || user?.role === "broker") {
            return <ShipperOrder />
        }
    }
  return (
   <>
    {getComponent()}
   </>
  )
}

export default Order
