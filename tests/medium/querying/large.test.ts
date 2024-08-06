// TODO(tai-kun): ベンチマークを新設してそっちに移したい。

import { describe, expect, test } from "vitest";
import surreal from "../surreal";

for (const { suite, Surreal, url } of surreal) {
  describe(suite, () => {
    test("16 KiB の文字列", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      const [text] = await db.query<[string]>(
        `RETURN "${"0123456789abcdef".repeat(1024)}"`,
      );

      expect(text).toHaveLength(16 * 1024);
    });
  });
}
