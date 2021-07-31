import { CustomCEFHttpService } from "./utils/http/custom_cef-http-service";

async function main(): Promise<void> {
  const dailyPrices = await CustomCEFHttpService.getCefCustomDailyPrices();
  console.log(dailyPrices);
}

main();
