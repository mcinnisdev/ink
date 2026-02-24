import { c } from "./colors.js";

const LOGO = `
  ┬  ┌┐┌  ┬┌─
  │  │││  ├┴┐
  ┴  ┘└┘  ┴ ┴`;

export function printBanner() {
  console.log(c.info(LOGO));
  console.log(c.dim("  Markdown-native CMS\n"));
}
