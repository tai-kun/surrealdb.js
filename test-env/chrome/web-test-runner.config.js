import { playwrightLauncher } from "@web/test-runner-playwright";

export default {
  nodeResolve: true,
  port: 9000,
  browsers: [
    playwrightLauncher({
      product: "chromium",
      launchOptions: {
        executablePath: process.env.BROWSER_EXECUTABLE_PATH,
      },
    }),
  ],
};
