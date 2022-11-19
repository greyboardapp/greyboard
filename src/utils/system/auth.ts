import { createEffect, createSignal } from "solid-js";
import { User } from "../../core/data/user";
import { pass } from "./misc";

const STORAGE_KEY = "user";

const localUserStr = localStorage.getItem(STORAGE_KEY);
const localUser : User | null = localUserStr ? (JSON.parse(localUserStr) as User) : null;

const [user, setUser] = createSignal<User | null>(localUser);

createEffect(() => {
    pass(user());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user()));
});

export const isLoggedIn = () : boolean => !!user();

export { user, setUser };
