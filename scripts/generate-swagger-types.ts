import fs from "fs";
import openApiTS from "openapi-typescript";

async function main(): Promise<void> {
  const output = await openApiTS(
    "https://rcz-portfolio.herokuapp.com/docs/swagger-spec.json"
  );
  fs.writeFileSync("./src/types/swaggerTypes.d.ts", output);
}

main();
