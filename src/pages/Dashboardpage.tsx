import { useNavigate } from "@solidjs/router";
import { Component } from "solid-js";
import { isLoggedIn, user } from "../utils/system/auth";

const DashboardPage : Component = () => {
    const navigate = useNavigate();
    if (!isLoggedIn())
        navigate("/");

    return (
        <>
            <p>Dashboard</p>
            <p>{user()?.username}</p>
            <p>{user()?.email}</p>
            <img src={user()?.avatar} />
        </>
    );
};
export default DashboardPage;
