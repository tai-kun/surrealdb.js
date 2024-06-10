import type { CreateEngine } from "../models/ClientAbc";
import HttpEngine from "./HttpEngine";

export default (
  function httpEngine(config) {
    return new HttpEngine(config);
  }
) satisfies CreateEngine;
