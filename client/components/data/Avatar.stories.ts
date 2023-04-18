import { makeComponentMetaFromVariants, makeStoryVariant, makeStoryVariants } from "../../utils/dom/storybook";
import Avatar, { AvatarVariants } from "./Avatar";

export default makeComponentMetaFromVariants(AvatarVariants, "Data/Avatar");

export const Default = makeStoryVariant(Avatar, {
    size: "m",
    user: {
        id: "0",
        name: "John Doe",
        email: "johndoe@email.com",
        avatar: "",
    },
});

export const WithImage = makeStoryVariant(Avatar, {
    size: "m",
    user: {
        id: "0",
        name: "John Doe",
        email: "johndoe@email.com",
        avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
    },
});

export const Variants = makeStoryVariants(Avatar, AvatarVariants, {
    user: {
        id: "0",
        name: "John Doe",
        email: "johndoe@email.com",
        avatar: "",
    },
});
