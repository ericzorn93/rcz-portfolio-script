import { Steps } from "./steps/steps";
// import { CustomCEFHttpService } from "./utils/http/custom_cef-http-service";

async function main(): Promise<void> {
  const steps = Steps.instance();
  // const dailyPrices = await CustomCEFHttpService.getCefCustomDailyPrices();
  await steps.getMoneyInvested();
  console.log(steps.moneyInvested);
}

main();
