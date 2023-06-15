import { Component, JSX, Show } from "solid-js";
import { Link } from "@solidjs/router";
import Title from "../components/typography/Title";
import Text from "../components/typography/Text";

import styles from "./HomePage.module.scss";
import Logo from "../assets/branding/logo.svg";
import GoogleLogo from "../assets/branding/google.svg";
import GithubLogo from "../assets/branding/github.svg";
import CarretIcon from "../assets/icons/carret.svg";
import { getGoogleAuthUrl, getGithubAuthUrl, logout } from "../api/auth";
import { setUser, user } from "../utils/system/auth";
import Button from "../components/controls/Button";
import Avatar from "../components/data/Avatar";
import { cls } from "../utils/dom/dom";
import Icon from "../components/data/Icon";

import manageBoardVideo from "../assets/branding/videos/manage.mp4?url";
import usecasesVideo from "../assets/branding/videos/usecases.mp4?url";
import workTogetherVideo from "../assets/branding/videos/workTogether.mp4?url";

const HomePage : Component = () => {
    const singInContent = () : JSX.Element => (
        <Show when={user()} keyed fallback={() => (
            <>
                <Text content="landing.signInWith" class="mt5" />
                <div class={styles.providerList}>
                    <a href={getGoogleAuthUrl()}><Icon icon={GoogleLogo} /></a>
                    <a href={getGithubAuthUrl()}><Icon icon={GithubLogo} /></a>
                </div>
            </>
        )}>
            {(loggedInUser) => (
                <>
                    <div class="flex h v-center my4">
                        <Avatar user={loggedInUser} />
                        <Text content={loggedInUser.name} size="l" class="ml2" />
                    </div>
                    <Link href="/dashboard"><Button content="buttons.goToMyDashboard" variant="primary" /></Link>
                    <Button content="buttons.logout" onClick={async () => {
                        logout();
                        setUser(null);
                    }} marginTop={3} />
                </>
            )}
        </Show>
    );

    const videoCard = (title : string, text : string, url : string) : JSX.Element => (
        <div class={cls(styles.videoCard, "mb4 l:mb6")}>
            <Title content={title} size="l" marginBottom={3} />
            <Text content={text} />
            <div class={styles.video}>
                <video autoplay loop muted>
                    <source src={url} />
                </video>
            </div>
        </div>
    );

    return (
        <div class={styles.container}>
            <section class={styles.landing}>
                <Icon icon={Logo} />
                <Title content="Greyboard" size="l" marginTop={3} />
                <Text content="landing.welcome" centered marginTop={5} marginBottom={4} />
                {singInContent()}
                <div class={styles.landingHint}>
                    <Text content="landing.wantToKnowMore" />
                    <Icon icon={CarretIcon} />
                </div>
            </section>
            <section class="container">
                {videoCard("landing.manageBoardsTitle", "landing.manageBoards", manageBoardVideo)}
                {videoCard("landing.useCasesTitle", "landing.useCases", usecasesVideo)}
                {videoCard("landing.workTogetherTitle", "landing.workTogether", workTogetherVideo)}
            </section>
            <section class={styles.footer}>
                <Title content="landing.wannaTry" size="l" />
                {singInContent()}
            </section>
        </div>
    );
};
export default HomePage;
