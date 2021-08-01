import inquirer from "inquirer";

import { CustomDailyPrice } from "../types/mappedTypes";
import { CustomCEFHttpService } from "../utils/http/custom_cef-http-service";

export class UserPrompts {
  /**
   * Singleton member of the steps
   * class to preserve state within the terminal instance.
   *
   * @private
   * @static
   * @type {(UserPrompts | null)}
   * @memberof UserPrompts
   */
  private static stepsInstance: UserPrompts | null = null;

  /**
   * Money Invested into each closed end fund.
   * This currently applies to the list of all closed end
   * funds.
   *
   * @static
   * @type {number}
   * @memberof UserPrompts
   */
  public moneyInvested: number = 1000;

  /**
   * List of all ticker symbols that we would like to fetch from the API.
   * This list can be custom defined, and or loaded directly from the API.
   *
   * @type {string[]}
   * @memberof UserPrompts
   */
  public tickerSymbols: string[] = [];

  /**
   * Obtains the list of custom daily prices,
   * based on the selected money invested and all chosen ticker
   * symbols from CEF connect.
   *
   * @type {CustomDailyPrice[]}
   * @memberof UserPrompts
   */
  public customDailyPrices: CustomDailyPrice[] = [];

  /**
   * List of custom daily prices with properties desired
   *
   * @type {(CustomDailyPrice[] | Partial<CustomDailyPrice[]>)}
   * @memberof UserPrompts
   */
  public selectedDailyPrices: CustomDailyPrice[] | Partial<CustomDailyPrice>[] =
    [];

  /**
   * Obtain singleton insatnce
   * of the inquire steps.
   *
   * @readonly
   * @static
   * @type {UserPrompts}
   * @memberof UserPrompts
   */
  public static instance(): UserPrompts {
    if (!UserPrompts.stepsInstance) {
      return new UserPrompts();
    }

    return UserPrompts.stepsInstance;
  }

  /**
   * This is the first question that is asked to the user.
   * It obtains the amount of money in dollar amount
   * that is applied to every Closed-End fund chosen.
   *
   * @return {Promise<number>}  {Promise<number>}
   * @memberof UserPrompts
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
   * @memberof UserPrompts
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
        // Split tickers on comma
        const splitInput = input.split(",");

        // Only one ticker symbol
        if (splitInput.length === 1) {
          return true;
        }

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
   * @memberof UserPrompts
   */
  public async getCustomDailyPriceData(): Promise<CustomDailyPrice[]> {
    const dailyPriceData = await CustomCEFHttpService.getCefCustomDailyPrices(
      this.moneyInvested,
      this.tickerSymbols
    );
    this.customDailyPrices = dailyPriceData;

    return dailyPriceData;
  }

  /**
   * Obtains list of custom daily prices with either partial
   * price properties or all properties from the API
   *
   * @return {*}  {Promise<CustomDailyPrice[]>}
   * @memberof UserPrompts
   */
  public async getTickersWithSelectedProperties(): Promise<
    Partial<CustomDailyPrice>[]
  > {
    // Set of unique keys for each custom daily price from CEF Connect
    const allDailyPriceProperties = new Set<keyof CustomDailyPrice>();

    // Add all custom daily price keys to the set
    this.customDailyPrices.forEach((customDailyPrice) => {
      Object.keys(customDailyPrice).forEach((key) => {
        // Add unique key to the set
        allDailyPriceProperties.add(key as keyof CustomDailyPrice);
      });
    });

    // Prompt user for properties selected
    const { useAllProperties } = await inquirer.prompt<{
      useAllProperties: boolean;
    }>({
      type: "confirm",
      name: "useAllProperties",
      default: true,
      message: "Would you like to use all properties from each CEF ticker?",
    });

    // If all properties are selected, select each property and include daily price
    if (useAllProperties) {
      const dailyPrices: Partial<CustomDailyPrice>[] = this.constructCEFPrice(
        Array.from(allDailyPriceProperties)
      );
      this.selectedDailyPrices = dailyPrices;

      return dailyPrices;
    }

    // Obtain custom properties to build the object
    const { chosenProperties } = await inquirer.prompt<{
      chosenProperties: (keyof CustomDailyPrice)[];
    }>({
      type: "checkbox",
      name: "chosenProperties",
      default: [...allDailyPriceProperties],
      message:
        "Please select properties you would like to use from each Close-End Fund...",
      choices: Array.from(allDailyPriceProperties).map((propName) => ({
        name: propName,
        checked: false,
        value: propName,
      })),
    });

    const dailyPrices: Partial<CustomDailyPrice>[] =
      this.constructCEFPrice(chosenProperties);
    this.selectedDailyPrices = dailyPrices;

    return dailyPrices;
  }

  /**
   * Loops over all properties that are found from each Closed-End Fund
   * and then builds an array of custom daily price object partials
   * with only the requested selected prop names.
   *
   * @private
   * @param {(keyof CustomDailyPrice)[]} selectedProps
   * @return {*}  {Partial<CustomDailyPrice>[]}
   * @memberof UserPrompts
   */
  private constructCEFPrice(
    selectedProps: (keyof CustomDailyPrice)[]
  ): Partial<CustomDailyPrice>[] {
    if (!selectedProps.length) {
      return [];
    }

    return this.customDailyPrices.map((dailyPrice) => {
      return selectedProps.reduce(
        (acc, propName) => ({
          ...acc,
          [propName]: dailyPrice[propName] ?? null,
        }),
        {} as Partial<CustomDailyPrice>
      );
    }) as Partial<CustomDailyPrice>[];
  }
}
