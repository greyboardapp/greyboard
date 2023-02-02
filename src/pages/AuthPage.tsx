import { useNavigate, useSearchParams } from "@solidjs/router";
import { Component } from "solid-js";
import { User } from "../core/data/user";
import { setUser } from "../utils/system/auth";
import { ObjectRecord } from "../utils/system/misc";

const AuthPage : Component = () => {
    const [user] = useSearchParams<ObjectRecord<User>>();
    if (!user || !user.name || !user.email || !user.avatar)
        setUser(null);
    else
        setUser({ ...user });

    const navigate = useNavigate();
    navigate("/dashboard", { replace: true });
    return <>Loading...</>;
};
export default AuthPage;
