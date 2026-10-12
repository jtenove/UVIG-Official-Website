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
  week: "2026-W42",

  crossword: {
    easy: {
      title: "Markets & Money",
      estimate: "~5 min",
      words: [
        { answer: "BROKER",  clue: "A person or platform that executes trades on your behalf" },
        { answer: "TICKER",  clue: "The short code identifying a stock, like AAPL" },
        { answer: "SHARES",  clue: "Units of ownership in a company" },
        { answer: "TREND",   clue: "The general direction a market is moving" },
        { answer: "VALUE",   clue: "Investing in stocks priced below what they're worth" },
        { answer: "WALLET",  clue: "Where you might store cash or crypto" },
        { answer: "DEBT",    clue: "Money owed to a lender" },
        { answer: "TAXES",   clue: "Mandatory payments to the government, including on some investment gains" },
        { answer: "GOALS",   clue: "Financial ___: the targets guiding your saving and investing" },
        { answer: "FUND",    clue: "A mutual ___ pools money from many investors" },
        { answer: "TRADE",   clue: "To buy or sell a security" },
        { answer: "GROWTH",  clue: "___ stock: a company expected to expand faster than average" }
      ]
    },
    hard: {
      title: "Trading & Instruments",
      estimate: "~5 min",
      words: [
        { answer: "CAPITAL",    clue: "Money invested in a business to generate income" },
        { answer: "SECURITY",   clue: "A tradable financial instrument, like a stock or bond" },
        { answer: "SHORT",      clue: "Betting that an asset's price will fall" },
        { answer: "SPREAD",     clue: "The gap between a security's bid and ask price" },
        { answer: "PREMIUM",    clue: "The price paid to buy an options contract" },
        { answer: "MATURITY",   clue: "The date a bond's principal is repaid" },
        { answer: "COUPON",     clue: "A bond's periodic interest payment" },
        { answer: "INDEX",      clue: "A benchmark tracking a basket of securities, like the S&P 500" },
        { answer: "BENCHMARK",  clue: "A standard used to measure a portfolio's performance" },
        { answer: "CUSTODIAN",  clue: "An institution that holds and safeguards an investor's assets" },
        { answer: "LONG",       clue: "Holding a position betting an asset's price will rise" }
      ]
    }
  },

  trivia: {
    title: "Market Trivia",
    questions: [
      {
        q: "What does IPO stand for?",
        options: ["Initial Public Offering", "Internal Profit Order", "Index Price Open", "Institutional Purchase Option"],
        answer: 0,
        explain: "An IPO is when a private company first sells shares to the public on a stock exchange."
      },
      {
        q: "Which of these is often considered a 'safe haven' asset during market uncertainty?",
        options: ["Gold", "Growth stocks", "Junk bonds", "Cryptocurrency"],
        answer: 0,
        explain: "Gold has historically been viewed as a store of value investors turn to when markets get volatile."
      },
      {
        q: "What is a 'blue chip' stock?",
        options: ["A penny stock under $1", "Shares in a well-established, financially stable company", "A stock that only trades after hours", "A company that just IPO'd"],
        answer: 1,
        explain: "Blue chip refers to large, reputable companies with a long track record of stable performance."
      },
      {
        q: "What does a 'bull market' describe?",
        options: ["Prices generally falling", "Prices generally rising", "Unusually low trading volume", "A market that's closed"],
        answer: 1,
        explain: "A bull market describes a sustained period of rising prices and investor optimism."
      },
      {
        q: "What is compound interest?",
        options: ["Interest paid only on the original principal", "Interest calculated on both principal and previously earned interest", "A fixed rate that never changes", "Interest charged only on loans, never earned on savings"],
        answer: 1,
        explain: "Compounding means you earn interest on your interest, which accelerates growth over time."
      },
      {
        q: "In Canada, what is an RRSP primarily designed to help you save for?",
        options: ["Education", "Retirement", "A first home, exclusively", "Emergencies"],
        answer: 1,
        explain: "A Registered Retirement Savings Plan helps Canadians save for retirement, with tax-deferred growth."
      },
      {
        q: "What is a 'dividend yield'?",
        options: ["Total dividends paid company-wide", "Annual dividend per share divided by share price", "The tax rate on dividend income", "The number of shareholders receiving dividends"],
        answer: 1,
        explain: "Dividend yield expresses a stock's annual dividend as a percentage of its current share price."
      },
      {
        q: "What happens in a 'stock split'?",
        options: ["A company issues more shares and lowers the price per share, without changing total value", "A company splits into two separate companies", "Two public companies merge", "A tax strategy for selling stock"],
        answer: 0,
        explain: "A stock split increases the number of shares and proportionally lowers the price — a shareholder's total value doesn't change."
      },
      {
        q: "Which best describes a 'small-cap' company?",
        options: ["Market value typically under about $2 billion", "Market value over $200 billion", "Trades only over-the-counter", "A government-owned company"],
        answer: 0,
        explain: "Small-cap companies generally have a market capitalization under roughly $2 billion, though exact thresholds vary."
      },
      {
        q: "What is a mutual fund?",
        options: ["A pooled, professionally managed investment held on behalf of many investors", "A loan from a bank", "A single company's stock", "A government savings bond"],
        answer: 0,
        explain: "A mutual fund pools money from many investors to buy a diversified portfolio, managed by a professional fund manager."
      }
    ]
  }
};
