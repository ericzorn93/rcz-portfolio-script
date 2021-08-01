import { green } from "chalk";

import { CSV } from "./steps/CSV";
import { UserPrompts } from "./steps/UserPrompts";

async function main(): Promise<void> {
  // Obtain original instance of steps
  const userPrompts = UserPrompts.instance();

  // Call all inquire methods and run calculations
  await userPrompts.getMoneyInvested();
  await userPrompts.getTickerSymbols();
  await userPrompts.getCustomDailyPriceData();
  await userPrompts.getTickersWithSelectedProperties();

  // Parse and Generate CSV File
  const csv = new CSV(userPrompts.selectedDailyPrices);
  await csv.generateCSV();
  console.log(
    green("Finished Generating CSV File with Closed-End Fund Data...")
  );
}

main();
