import inquirer from "inquirer";
import { components } from "../types/swaggerTypes";
import { CustomCEFHttpService } from "../utils/http/custom_cef-http-service";

export class Steps {
  /**
   * Singleton member of the steps
   * class to preserve state within the terminal instance.
   *
   * @private
   * @static
   * @type {(Steps | null)}
   * @memberof Steps
   */
  private static stepsInstance: Steps | null = null;

  /**
   * Money Invested into each closed end fund.
   * This currently applies to the list of all closed end
   * funds.
   *
   * @static
   * @type {number}
   * @memberof Steps
   */
  public moneyInvested: number = 1000;

  /**
   * List of all ticker symbols that we would like to fetch from the API.
   * This list can be custom defined, and or loaded directly from the API.
   *
   * @type {string[]}
   * @memberof Steps
   */
  public tickerSymbols: string[] = [];

  /**
   * Obtains the list of custom daily prices,
   * based on the selected money invested and all chosen ticker
   * symbols from CEF connect.
   *
   * @type {components['schemas']['CustomCEFDailyPrice'][]}
   * @memberof Steps
   */
  public customDailyPrices: components["schemas"]["CustomCEFDailyPrice"][] = [];

  /**
   * Obtain singleton insatnce
   * of the inquire steps.
   *
   * @readonly
   * @static
   * @type {Steps}
   * @memberof Steps
   */
  public static instance(): Steps {
    if (!Steps.stepsInstance) {
      return new Steps();
    }

    return Steps.stepsInstance;
  }

  /**
   * This is the first question that is asked to the user.
   * It obtains the amount of money in dollar amount
   * that is applied to every Closed-End fund chosen.
   *
   * @return {Promise<number>}  {Promise<number>}
   * @memberof Steps
   */
  public async getMoneyInvested(): Promise<number> {
    const data = await inquirer.prompt<{ moneyInvested: number }>({
      type: "number",
      name: "moneyInvested",
      default: 1000,
      message:
        "Please Enter the Dollar Amount of Money Invested into each Closed-End Fund (This applies to all funds)...",
    });

    this.moneyInvested = data.moneyInvested;
    return data.moneyInvested;
  }

  /**
   * Requests all ticker symbols from the CEF connect site.
   * It then determines if the user wants to select all ticker symbols,
   * or custom input their selected ticker symbols.
   *
   * @return {*}  {Promise<string[]>}
   * @memberof Steps
   */
  public async getTickerSymbols(): Promise<string[]> {
    // Fetch all ticker symbols before requesting them from the user
    const allTickerSymbols = await CustomCEFHttpService.getCEFTickerSymbols();

    // Ask user if they would like to use all ticker symbols in their query
    const { requestedAllTickerSymbols } = await inquirer.prompt<{
      requestedAllTickerSymbols: boolean;
    }>({
      type: "confirm",
      name: "requestedAllTickerSymbols",
      default: true,
      message: "Would you like to use all CEF Ticker Symbols?",
    });

    // If the user prefers all ticker symbols, do not filter further and return them
    if (requestedAllTickerSymbols) {
      this.tickerSymbols = allTickerSymbols;
      return this.tickerSymbols;
    }

    // Custom input all ticker symbols in CSV format
    const { selectedTickerSymbols } = await inquirer.prompt<{
      selectedTickerSymbols: string;
    }>({
      type: "input",
      name: "selectedTickerSymbols",
      default: "",
      message:
        "Please enter all desired CEF ticker symbols in CSV format (ABC,DEF)...",
      validate: (input: string) => {
        const csvRegex = /([A-Z,]+)/g;

        return csvRegex.test(input);
      },
    });

    // Only include valid custom provided ticker symbols that exist from CEF connect data
    const filteredSymbols = selectedTickerSymbols
      .split(",")
      .map((sym) => sym.toUpperCase())
      .filter((sym) => allTickerSymbols.includes(sym));

    this.tickerSymbols = filteredSymbols;
    return filteredSymbols;
  }

  /**
   * Fetches and assigns the custom CEF Connect Daily Price
   * data from our API and includes our custom calculations.
   *
   * @return {*}  {Promise<
   *     components["schemas"]["CustomCEFDailyPrice"][]
   *   >}
   * @memberof Steps
   */
  public async getCustomDailyPriceData(): Promise<
    components["schemas"]["CustomCEFDailyPrice"][]
  > {
    const dailyPriceData = await CustomCEFHttpService.getCefCustomDailyPrices(
      this.moneyInvested,
      this.tickerSymbols
    );
    this.customDailyPrices = dailyPriceData;

    return dailyPriceData;
  }
}
