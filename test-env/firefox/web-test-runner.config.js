import { setup } from "@tools/surrealdb/setup";
import { seleniumLauncher } from "@web/test-runner-selenium";
import { Browser, Builder } from "selenium-webdriver";

const conn = await setup();

export default {
  nodeResolve: true,
  port: 9000,
  browsers: [seleniumLauncher({
    driverBuilder: new Builder()
      .forBrowser(Browser.FIREFOX)
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
  testsFinishTimeout: 30 * 60 * 1_000, // 30 min
};
