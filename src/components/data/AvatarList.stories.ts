import { makeComponentMetaFromVariants, makeStoryVariant } from "../../utils/dom/storybook";
import AvatarList from "./AvatarList";

export default makeComponentMetaFromVariants({}, "Data/AvatarList");

export const Default = makeStoryVariant(AvatarList, {
    users: [
        {
            id: 0,
            name: "John Doe",
        },
        {
            id: 1,
            name: "Philip Gonzalez",
        },
        {
            id: 2,
            name: "Samantha Green",
        },
    ],
    size: "m",
});

export const WithMe = makeStoryVariant(AvatarList, {
    users: [
        {
            id: 0,
            name: "John Doe",
        },
        {
            id: 1,
            name: "Philip Gonzalez",
        },
        {
            id: 2,
            name: "Samantha Green",
        },
    ],
    me: 0,
    size: "m",
});

export const WithImages = makeStoryVariant(AvatarList, {
    users: [
        {
            id: 0,
            name: "John Doe",
            avatarUrl: "https://xsgames.co/randomusers/avatar.php?g=male",
        },
        {
            id: 1,
            name: "Philip Gonzalez",
            avatarUrl: "https://xsgames.co/randomusers/avatar.php?g=male",
        },
        {
            id: 2,
            name: "Samantha Green",
            avatarUrl: "https://xsgames.co/randomusers/avatar.php?g=female",
        },
    ],
    size: "m",
});

export const WithImagesAndMe = makeStoryVariant(AvatarList, {
    users: [
        {
            id: 0,
            name: "John Doe",
            avatarUrl: "https://xsgames.co/randomusers/avatar.php?g=male",
        },
        {
            id: 1,
            name: "Philip Gonzalez",
            avatarUrl: "https://xsgames.co/randomusers/avatar.php?g=male",
        },
        {
            id: 2,
            name: "Samantha Green",
            avatarUrl: "https://xsgames.co/randomusers/avatar.php?g=female",
        },
    ],
    me: 0,
    size: "m",
});

export const Mixed = makeStoryVariant(AvatarList, {
    users: [
        {
            id: 0,
            name: "John Doe",
            avatarUrl: "https://xsgames.co/randomusers/avatar.php?g=male",
        },
        {
            id: 1,
            name: "Philip Gonzalez",
        },
        {
            id: 2,
            name: "Samantha Green",
            avatarUrl: "https://xsgames.co/randomusers/avatar.php?g=female",
        },
    ],
    size: "m",
});

export const ManyUsers = makeStoryVariant(AvatarList, {
    users: new Array(42).fill(
        {
            id: 0,
            name: "John Doe",
            avatarUrl: "https://xsgames.co/randomusers/avatar.php?g=male",
        },
    ),
    size: "m",
});
