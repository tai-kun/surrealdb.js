import type { CreateEngine } from "../clients/Abc";
import HttpEngine from "./HttpEngine";

export default (
  function httpEngine(config) {
    return new HttpEngine(config);
  }
) satisfies CreateEngine;
