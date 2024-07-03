import { setup } from "@tools/surrealdb/setup";
import { defaultReporter, summaryReporter } from "@web/test-runner";
import { seleniumLauncher } from "@web/test-runner-selenium";
import { Browser, Builder } from "selenium-webdriver";

const conn = await setup();

export default {
  nodeResolve: true,
  reporters: [
    defaultReporter({
      reportTestResults: true,
      reportTestProgress: false,
    }),
    summaryReporter(),
  ],
  port: 9000,
  browsers: [seleniumLauncher({
    driverBuilder: new Builder()
      .forBrowser(Browser.CHROME)
      .usingServer("http://localhost:4444/wd/hub"),
  })],
  testRunnerHtml: testFramework =>
    `<html>
      <body>
        <script>
          globalThis.SURREALDB = ${JSON.stringify(conn)};
        </script>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>`,
};
