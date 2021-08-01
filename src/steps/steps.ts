import inquirer from "inquirer";

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
}
