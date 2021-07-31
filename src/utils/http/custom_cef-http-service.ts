import axios, { AxiosInstance } from "axios";
import { red } from "chalk";

export class CustomCEFHttpService {
  private static get cefApi(): AxiosInstance {
    return axios.create({
      baseURL: "https://rcz-portfolio.herokuapp.com",
      headers: {
        Accept: "application/json",
      },
    });
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
    try {
      const { data: allSymbols } = await this.cefApi.get<string[]>(
        "/v1/cef-connect/symbols"
      );
      return allSymbols;
    } catch (err) {
      console.error(red("Cannot fetch symbols"));
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
  ): Promise<any> {
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

      return data;
    } catch (err) {
      console.error(red("Cannot fetch closed end fund data at this time"));
      process.exit(1);
    }
  }
}
