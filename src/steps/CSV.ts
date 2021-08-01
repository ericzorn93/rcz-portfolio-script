import { resolve } from "path";
import { homedir } from "os";
import { existsSync, writeFileSync } from "fs";
import { Parser } from "json2csv";
import inquirer from "inquirer";

import { CustomDailyPrice } from "../types/mappedTypes";

export class CSV {
  private readonly customDailyPrices: Partial<CustomDailyPrice>[];

  constructor(customDailyPrices: Partial<CustomDailyPrice>[]) {
    this.customDailyPrices = customDailyPrices;
  }

  public async generateCSV(): Promise<void> {
    // Parse incoming JSON objects and output as CSV string
    const parser = this.getParser();
    const csvParseContent = parser.parse(this.customDailyPrices);

    // New File Name
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const today = now.getDate() + 1;
    const year = now.getFullYear();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Create default file path and file name
    const currentTimeStamp = `${currentMonth}.${today}.${year}-${hour}.${minutes}.${seconds}`;
    const fileName = `${currentTimeStamp} rcz-cef-portfolio.csv`;
    const defaultFilePath = resolve(homedir(), "Desktop", fileName);

    // Ask user for the file path to output the csv file
    const { outputFilePath } = await inquirer.prompt<{
      outputFilePath: string;
    }>({
      type: "input",
      name: "outputFilePath",
      default: defaultFilePath,
      validate: (input: string) => {
        // Current Directory
        if (input === ".") {
          return true;
        }

        const fileNameIndex = input.indexOf(`/${fileName}`);
        const upToFilePath = input.substr(0, fileNameIndex);

        return existsSync(upToFilePath);
      },
    });

    // Output CSV file and overwrite current directory with proper path name
    let finalPath = outputFilePath.trim();
    if (finalPath === "." || finalPath === "./") {
      finalPath = resolve(process.cwd(), fileName);
    }

    // Write CSV file to file system at output path requested by the user
    writeFileSync(finalPath, csvParseContent);
  }

  /**
   * Obtains CSV parser instance with the requested properties
   * for each Closed-End fund.
   *
   * @private
   * @return {*}  {Parser<unknown>}
   * @memberof CSV
   */
  private getParser(): Parser<unknown> {
    const [firstPrice = {}] = this.customDailyPrices;
    const fields = Object.keys(firstPrice);

    return new Parser({
      fields,
    });
  }
}
