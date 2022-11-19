import { useNavigate, useSearchParams } from "@solidjs/router";
import { Component } from "solid-js";
import { User } from "../core/data/user";
import { setUser } from "../utils/system/auth";

const AuthPage : Component = () => {
    const [user] = useSearchParams<User>();
    if (!user || !user.username || !user.email || !user.avatar)
        setUser(null);
    else
        setUser({ ...user });

    const navigate = useNavigate();
    navigate("/dashboard", { replace: true });
    return <>Loading...</>;
};
export default AuthPage;
