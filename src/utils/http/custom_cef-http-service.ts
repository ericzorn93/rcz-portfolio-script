import axios, { AxiosInstance } from "axios";
import { red } from "chalk";
import ora from "ora";
import { components } from "../../types/swaggerTypes";

export class CustomCEFHttpService {
  /**
   * CEF Connect API Instance that is using
   * Axios for data fetching to our custom API
   * that is hosted on heroku. This API proxies to
   * the CEF Connect API and performs the necessary
   * custom calculations for our portfolio.
   *
   * @readonly
   * @private
   * @static
   * @type {AxiosInstance}
   * @memberof CustomCEFHttpService
   */
  private static get cefApi(): AxiosInstance {
    return axios.create({
      baseURL: "https://rcz-portfolio.herokuapp.com",
      headers: {
        Accept: "application/json",
      },
    });
  }

  /**
   * Get ora loading spinner to determine
   * when the client is fetching data from the API
   * in order to indicate to the user to wait.
   *
   * @private
   * @static
   * @param {ora.Color} spinnerColor
   * @param {string} [message="Loading..."]
   * @return {*}  {ora.Ora}
   * @memberof CustomCEFHttpService
   */
  private static getLoadingSpinner(
    spinnerColor: ora.Color,
    message: string = "Loading..."
  ): ora.Ora {
    const spinner = ora(message).start();
    spinner.color = spinnerColor;
    return spinner;
  }

  /**
   * Fetches all CEF connect ticker symbols from the custom proxy
   * API that is currently hosted on herok
   *
   * @static
   * @return {Promise<string[]>}  {Promise<string[]>}
   * @memberof CustomCEFHttpService
   */
  public static async getCEFTickerSymbols(): Promise<string[]> {
    const spinner = CustomCEFHttpService.getLoadingSpinner(
      "green",
      "Loading all ticker symbols from CEF Connect..."
    );

    try {
      const { data: allSymbols } = await this.cefApi.get<string[]>(
        "/v1/cef-connect/symbols"
      );
      spinner.stop();
      return allSymbols;
    } catch (err) {
      console.error(red("Cannot fetch symbols"));
      spinner.stop();
      process.exit(1);
    }
  }

  /**
   * Accepts the income list of preferred
   * ticker symbols for each closed end fund, as
   * well as the money that the person prefers to invest
   *
   * @static
   * @param {number} [moneyInvested=1000]
   * @param {string[]} [tickerSymbols=[]]
   * @return {*}  {Promise<any>}
   * @memberof CustomCEFHttpService
   */
  public static async getCefCustomDailyPrices(
    moneyInvested: number = 1000,
    tickerSymbols: string[] = []
  ): Promise<components["schemas"]["CustomCEFDailyPrice"][]> {
    const spinner = CustomCEFHttpService.getLoadingSpinner(
      "green",
      "Loading CEF Connect with Custom Daily Prices..."
    );

    // Accepts the list of incoming ticker symbols and maps them to an uppercase csv string
    let mappedSymbols: string;
    if (!tickerSymbols || !tickerSymbols.length) {
      mappedSymbols = "";
    } else {
      mappedSymbols = tickerSymbols.map((sym) => sym.toUpperCase()).join(",");
    }

    try {
      const { data } = await this.cefApi.get(
        "/v1/cef-connect/custom-daily-prices",
        {
          params: {
            moneyInvested,
            tickerSymbols: mappedSymbols,
          },
        }
      );

      spinner.stop();
      return data;
    } catch (err) {
      console.error(red("Cannot fetch closed end fund data at this time"));
      spinner.stop();
      process.exit(1);
    }
  }
}
