import { Steps } from "./steps/steps";

async function main(): Promise<void> {
  // Obtain original instance of steps
  const steps = Steps.instance();

  // Call all inquire methods and run calculations
  await steps.getMoneyInvested();
  await steps.getTickerSymbols();
  await steps.getCustomDailyPriceData();
  await steps.getTickersWithSelectedProperties();
  console.log(steps.selectedDailyPrices);
}

main();
