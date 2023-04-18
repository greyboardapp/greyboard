import { AnimationOptionsWithOverrides } from "@motionone/solid";

export const quickEaseOutTransition : AnimationOptionsWithOverrides = {
    duration: 0.1,
    easing: [0.8, 0, 1, 1],
};

export const quickEaseInTransition : AnimationOptionsWithOverrides = {
    duration: 0.3,
    easing: [0, 1, 0.2, 1],
};
