import { createProgram } from "../util/ka_utils.js";
import fs from "fs";

let kaas = "_9KPIHEq-vaDfuoxPYO7Hw";

(async () => {
  let data = await createProgram(kaas, "console.log('hello world')", "hello world", 600, 600, "pjs")
  console.log(data)
  fs.writeFileSync("./test/ka.json", JSON.stringify(data, null, 2))
})();
