import { describe, expect, test } from "vitest";
import surreal from "../surreal.js";

for (const { suite, fmt, url, Surreal } of surreal) {
  describe.runIf(fmt === "json")(suite, () => {
    test("変数を定義する", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await db.let("js_number", 123);
      const result = await db.query<[number]>(/*surql*/ `RETURN $js_number`);

      expect(result).toStrictEqual([123]);
    });

    test("変数を再定義する", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await db.let("js_number", 123);
      await db.let("js_number", 456);
      const result = await db.query<[number]>(/*surql*/ `RETURN $js_number`);

      expect(result).toStrictEqual([456]);
    });

    test("変数を削除する", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await db.let("js_number", 123);
      await db.unset("js_number");
      await db.use("my_namespace", "my_database");
      const result = await db.query<[unknown]>(/*surql*/ `RETURN $js_number`);

      expect(result).toStrictEqual([null]);
    });

    test("変数は不変である", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      const obj = { key: "value" };
      await db.let("js_object", obj);
      obj.key = "changed";
      const result = await db.query<[typeof obj]>(
        /*surql*/ `RETURN $js_object`,
      );

      expect(obj).toStrictEqual({ key: "changed" });
      expect(result).toStrictEqual([{ key: "value" }]);
    });
  });

  describe.runIf(fmt === "cbor")(suite, () => {
    test("変数を定義する", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await db.let("js_number", 123);
      const result = await db.query<[number]>(/*surql*/ `RETURN $js_number`);

      expect(result).toStrictEqual([123]);
    });

    test("変数を再定義する", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await db.let("js_number", 123);
      await db.let("js_number", 456);
      const result = await db.query<[number]>(/*surql*/ `RETURN $js_number`);

      expect(result).toStrictEqual([456]);
    });

    test("変数を削除する", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      await db.let("js_number", 123);
      await db.unset("js_number");
      await db.use("my_namespace", "my_database");
      const result = await db.query<[unknown]>(/*surql*/ `RETURN $js_number`);

      expect(result).toStrictEqual([undefined]);
    });

    test("変数は不変である", async () => {
      await using db = new Surreal();
      await db.connect(url());
      await db.signin({ user: "root", pass: "root" });

      const obj = { key: "value" };
      await db.let("js_object", obj);
      obj.key = "changed";
      const result = await db.query<[typeof obj]>(
        /*surql*/ `RETURN $js_object`,
      );

      expect(obj).toStrictEqual({ key: "changed" });
      expect(result).toStrictEqual([{ key: "value" }]);
    });
  });
}
