import React from "react";
import LoadListPage from "../components/load/ShipperLoad";
import DriverLoad from "../components/load/DriverLoad";
import useAuth from "../hooks/useAuth";

const Load = () => {
    const { user } = useAuth();
    
    return (
        <>
            {user?.role === "driver" && <DriverLoad />}
            {(user?.role === "shipper" || user?.role === "broker") && (
                <LoadListPage />
            )}

            {/* <LoadListPage/> */}
            {/* <DriverLoad/> */}
        </>
    );
};

export default Load;
