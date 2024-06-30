import { playwrightLauncher } from "@web/test-runner-playwright";

export default {
  nodeResolve: true,
  port: 9000,
  browsers: [
    playwrightLauncher({
      product: "firefox",
      launchOptions: {
        executablePath: process.env.BROWSER_EXECUTABLE_PATH,
      },
    }),
  ],
};
