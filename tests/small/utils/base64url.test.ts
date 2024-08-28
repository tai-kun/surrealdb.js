import { base64url } from "@tai-kun/surrealdb/utils";
import { test } from "vitest";

test.for<[encoded: string, decoded: string]>([
  ["Sl8_QiM-fjQ", "J_?B#>~4"], // Sl8/QiM+fjQ=
  ["fiY-fXhKan0_JiFwdFBeLQ", "~&>}xJj}?&!ptP^-"], // fiY+fXhKan0/JiFwdFBeLQ==
])("%s を %s にデコード", ([encoded, decoded], { expect }) => {
  expect(base64url.decode(encoded)).toBe(decoded);
});
