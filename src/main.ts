import { UserPrompts } from "./steps/UserPrompts";

async function main(): Promise<void> {
  // Obtain original instance of steps
  const userPrompts = UserPrompts.instance();

  // Call all inquire methods and run calculations
  await userPrompts.getMoneyInvested();
  await userPrompts.getTickerSymbols();
  await userPrompts.getCustomDailyPriceData();
  await userPrompts.getTickersWithSelectedProperties();
  console.log(userPrompts.selectedDailyPrices);
}

main();
