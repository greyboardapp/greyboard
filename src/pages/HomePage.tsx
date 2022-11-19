import { Link } from "@solidjs/router";
import { Component } from "solid-js";

const HomePage : Component = () => (
    <>
        <p>Home</p>
        <Link href="/b/00000000">To Home</Link>
        <a href={`${import.meta.env.BACKEND_URL}/api/auth/logout`}>Logout</a>
    </>
);
export default HomePage;
