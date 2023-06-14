import { getSignOutResponse } from "../../auth";
import { Env } from "../../utils";

export const onRequestGet : PagesFunction<Env> = ({ env }) => getSignOutResponse(env);
