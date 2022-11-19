import { Component, createSignal } from "solid-js";
import Title from "../components/typography/Title";
import Text from "../components/typography/Text";

import styles from "./SignInPage.module.scss";
import Logo from "../assets/branding/logo.svg";
import GoogleLogo from "../assets/branding/google.svg";
import GithubLogo from "../assets/branding/github.svg";

const SignInPage : Component = () => (
    <div class={styles.container}>
        <div class={styles.content}>
            <Logo />
            <Title content="Greyboard" size="l" class="mt3" />
            <Text content="texts.signInWith" class="mt5" />
            <div class={styles.providerList}>
                <a href={`${import.meta.env.BACKEND_URL}/api/auth/google`}><GoogleLogo /></a>
                <a href={`${import.meta.env.BACKEND_URL}/api/auth/github`}><GithubLogo /></a>
            </div>
            <svg class={styles.wave} viewBox="0 0 520 1000" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M260 500C0 760 0 1000 0 1000V0H520C520 0 520 240 260 500Z" fill="currentColor"></path>
            </svg>
        </div>
    </div>
);
export default SignInPage;
