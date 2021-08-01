import { Steps } from "./steps/steps";

async function main(): Promise<void> {
  // Obtain original instance of steps
  const steps = Steps.instance();

  // Call all inquire methods and run calculations
  await steps.getMoneyInvested();
  await steps.getTickerSymbols();
  await steps.getCustomDailyPriceData();
  console.log(steps.customDailyPrices);
}

main();
