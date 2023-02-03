import { Component, Show } from "solid-js";
import Title from "../components/typography/Title";
import Text from "../components/typography/Text";

import styles from "./HomePage.module.scss";
import Logo from "../assets/branding/logo.svg";
import GoogleLogo from "../assets/branding/google.svg";
import GithubLogo from "../assets/branding/github.svg";
import { getGoogleAuthUrl, getGithubAuthUrl, logout } from "../api/auth";
import { setUser, user } from "../utils/system/auth";
import Button from "../components/controls/Button";

const HomePage : Component = () => (
    <div class={styles.container}>
        <div class={styles.content}>
            <Logo />
            <Title content="Greyboard" size="l" class="mt3" />
            <Show when={user()} keyed fallback={() => (
                <>
                    <Text content="texts.signInWith" class="mt5" />
                    <div class={styles.providerList}>
                        <a href={getGoogleAuthUrl()}><GoogleLogo /></a>
                        <a href={getGithubAuthUrl()}><GithubLogo /></a>
                    </div>
                </>
            )}>
                {(loggedInUser) => (
                    <>
                        <Text content="texts.signedInWith" class="mt5" />
                        <Text content={loggedInUser.name} size="l" class="my3" />
                        <Button content="buttons.goToMyDashboard" variant="primary" to="/dashboard" />
                        <Button content="buttons.logout" onClick={async () => {
                            logout();
                            setUser(null);
                        }} />
                    </>
                )}
            </Show>
            <svg class={styles.wave} viewBox="0 0 520 1000" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M260 500C0 760 0 1000 0 1000V0H520C520 0 520 240 260 500Z" fill="currentColor"></path>
            </svg>
        </div>
    </div>
);
export default HomePage;
