import { Link } from "@solidjs/router";
import { Component } from "solid-js";

const HomePage : Component = () => (
    <>
        <p>Home</p>
        <Link href="/b/00000000">To Home</Link>
    </>
);
export default HomePage;
