import { CustomCEFHttpService } from "./utils/http/custom_cef-http-service";

async function main(): Promise<void> {
  await CustomCEFHttpService.getCefCustomDailyPrices(5000);
  // console.log(symbols);
}

main();
