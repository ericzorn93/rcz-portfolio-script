import axios, { AxiosInstance } from "axios";

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
      console.error("Cannot fetch symbols");
      process.exit(1);
    }
  }
}
