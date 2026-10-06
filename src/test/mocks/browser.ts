import { setupWorker } from "msw/browser";
import { authHandlers } from "./authHandlers";

export const worker = setupWorker(...authHandlers);
