import { setup } from "@tools/surrealdb/setup";
import { defaultReporter, summaryReporter } from "@web/test-runner";
import { playwrightLauncher } from "@web/test-runner-playwright";

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
  browsers: [
    playwrightLauncher({
      product: "webkit",
    }),
  ],
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
