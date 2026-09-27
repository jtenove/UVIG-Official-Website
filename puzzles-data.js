/* ============================================================
   UVIG WEEKLY PUZZLES: content file
   This is the only file you need to edit each week.

   CROSSWORD
   - Just list answers and clues. The page builds the grid
     layout automatically.
   - Answers: letters only (spaces/punctuation are stripped).
     Aim for 11-13 words per puzzle, 3-9 letters each, and keep
     the total letter count under about 80. Long answer lists
     can't all fit on a phone-sized grid. Harder clues, not
     longer words, are what make the hard puzzle hard.
   - Change "week" every week. It is used as the seed for the
     layout, so a new week gives a fresh grid, and everyone
     who opens the same week sees the exact same grid.
   - If a word can't fit, the page skips it and prints a
     warning in the browser console (right-click > Inspect >
     Console). Swapping in a word with more common letters
     usually fixes it.

   TRIVIA
   - "answer" is the position of the correct option,
     counting from 0 (first option = 0, second = 1, ...).
   - "explain" is shown after the player answers.
   ============================================================ */

const PUZZLES = {
  week: "2026-W40",

  crossword: {
    easy: {
      title: "Investing Basics",
      estimate: "~5 min",
      words: [
        { answer: "STOCK",    clue: "A share of ownership in a company" },
        { answer: "BOND",     clue: "A loan you make to a government or company in exchange for interest" },
        { answer: "MARKET",   clue: "Where buyers and sellers trade securities" },
        { answer: "SAVINGS",  clue: "A high-interest ___ account" },
        { answer: "BUDGET",   clue: "A plan for how you'll spend your money" },
        { answer: "INTEREST", clue: "The cost of borrowing money, or what a deposit earns" },
        { answer: "DIVIDEND", clue: "A payment a company makes to shareholders out of its profits" },
        { answer: "BANK",     clue: "Where you might open a chequing account" },
        { answer: "CASH",     clue: "The most liquid asset there is" },
        { answer: "PROFIT",   clue: "What's left of revenue after costs" },
        { answer: "RISK",     clue: "The chance an investment loses money" },
        { answer: "LOAN",     clue: "Borrowed money that has to be paid back" },
        { answer: "INCOME",   clue: "Money earned from work or investments" }
      ]
    },
    hard: {
      title: "Advanced Concepts",
      estimate: "~5 min",
      words: [
        { answer: "PORTFOLIO",  clue: "An investor's full collection of holdings" },
        { answer: "LEVERAGE",   clue: "Using borrowed money to amplify potential returns" },
        { answer: "OPTION",     clue: "The right, but not the obligation, to buy or sell at a set price" },
        { answer: "LIQUIDITY",  clue: "How quickly an asset can become cash without moving its price" },
        { answer: "EQUITY",     clue: "Ownership value left after subtracting liabilities" },
        { answer: "HEDGE",      clue: "A position taken to offset the risk of another" },
        { answer: "YIELD",      clue: "A bond's annual income as a percentage of its price" },
        { answer: "ARBITRAGE",  clue: "Profiting from a price gap for the same asset in two markets" },
        { answer: "MARGIN",     clue: "Money borrowed from a broker to buy securities" },
        { answer: "INFLATION",  clue: "A general rise in prices that erodes purchasing power" },
        { answer: "ASSET",      clue: "Anything owned that has economic value" }
      ]
    }
  },

  trivia: {
    title: "Market Trivia",
    questions: [
      {
        q: "What does a company's P/E ratio compare?",
        options: ["Profit to expenses", "Share price to earnings per share", "Price to equity value", "Payout to earnings"],
        answer: 1,
        explain: "P/E divides the share price by earnings per share, showing how much investors pay for each dollar of earnings."
      },
      {
        q: "What is Canada's largest stock exchange?",
        options: ["NASDAQ", "TSX Venture Exchange", "Toronto Stock Exchange (TSX)", "Montreal Exchange"],
        answer: 2,
        explain: "The Toronto Stock Exchange is Canada's main exchange. The Montreal Exchange focuses on derivatives."
      },
      {
        q: "A bear market is commonly defined as a decline of at least how much from a recent high?",
        options: ["5%", "10%", "20%", "50%"],
        answer: 2,
        explain: "A 10% drop is usually called a correction. A 20% drop is the common threshold for a bear market."
      },
      {
        q: "When interest rates rise, what generally happens to the prices of existing bonds?",
        options: ["They fall", "They rise", "They stay the same", "They double"],
        answer: 0,
        explain: "Newer bonds pay the higher rate, so older, lower-paying bonds become less valuable and their prices fall."
      },
      {
        q: "What does ETF stand for?",
        options: ["Equity Trust Fund", "Exchange-Traded Fund", "Electronic Transfer Fund", "Estimated Total Fees"],
        answer: 1,
        explain: "An exchange-traded fund holds a basket of assets and trades on an exchange like a single stock."
      },
      {
        q: "Using the Rule of 72, roughly how long does it take money to double at an 8% annual return?",
        options: ["6 years", "9 years", "12 years", "15 years"],
        answer: 1,
        explain: "Divide 72 by the annual return: 72 / 8 = 9 years."
      },
      {
        q: "Who sets Canada's policy interest rate?",
        options: ["The Department of Finance", "The Big Five banks", "The TSX", "The Bank of Canada"],
        answer: 3,
        explain: "The Bank of Canada sets the policy rate, which influences borrowing costs across the economy."
      },
      {
        q: "Which Canadian account lets investments grow and be withdrawn completely tax-free?",
        options: ["RRSP", "TFSA", "RESP", "A chequing account"],
        answer: 1,
        explain: "TFSA growth and withdrawals are tax-free. RRSP withdrawals are taxed as income."
      },
      {
        q: "How is a company's market capitalization calculated?",
        options: ["Revenue × profit margin", "Total assets − total debt", "Share price × shares outstanding", "Earnings × dividend"],
        answer: 2,
        explain: "Market cap is the total market value of a company's shares: price times shares outstanding."
      },
      {
        q: "What is the main goal of diversification?",
        options: ["Guaranteeing higher returns", "Reducing risk by spreading investments", "Avoiding all taxes", "Trading more often"],
        answer: 1,
        explain: "Spreading money across different assets means one bad investment has less impact on the whole portfolio."
      }
    ]
  }
};
