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
   - Same easy/hard split as the crossword — "easy" and "hard"
     are each their own full question set.
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
   easy: {
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
   },
   hard: {
    title: "Advanced Trivia",
    questions: [
      {
        q: "What does a bond's 'duration' measure?",
        options: ["Its time to maturity in years", "Its price sensitivity to interest rate changes", "Its credit rating", "How often it pays a coupon"],
        answer: 1,
        explain: "Duration approximates how much a bond's price will move for a 1% change in interest rates — it's about price sensitivity, not just time to maturity."
      },
      {
        q: "In the Capital Asset Pricing Model (CAPM), what does 'beta' measure?",
        options: ["A stock's dividend growth rate", "A stock's volatility relative to the overall market", "A company's debt-to-equity ratio", "A stock's P/E ratio relative to its peers"],
        answer: 1,
        explain: "Beta measures how much a stock's price tends to move relative to the broader market — above 1 means more volatile than the market."
      },
      {
        q: "What does it mean when the yield curve 'inverts'?",
        options: ["Short-term rates rise above long-term rates", "Long-term rates rise above short-term rates", "All yields become equal", "Bond prices rise across the board"],
        answer: 0,
        explain: "An inverted yield curve happens when short-term yields exceed long-term yields, often viewed as a recession warning sign."
      },
      {
        q: "What is 'short selling'?",
        options: ["Selling a stock you own for a quick profit", "Borrowing and selling a stock, hoping to buy it back cheaper later", "Buying a stock with a short holding period", "Selling only small quantities of a stock"],
        answer: 1,
        explain: "Short sellers borrow shares, sell them, and aim to repurchase them later at a lower price, profiting from the decline."
      },
      {
        q: "What does WACC stand for and measure?",
        options: ["Weighted Average Cost of Capital — a firm's blended cost of financing", "Worldwide Asset Credit Class", "Weighted Allocation of Current Capital", "Weekly Average Closing Change"],
        answer: 0,
        explain: "WACC blends the cost of a company's debt and equity, weighted by how much of each it uses, into one overall financing cost."
      },
      {
        q: "Under the Efficient Market Hypothesis, what does 'weak form' efficiency claim?",
        options: ["Prices reflect all information, including insider information", "Prices already reflect all past trading information", "Prices only reflect public financial statements", "Markets are never efficient"],
        answer: 1,
        explain: "Weak-form efficiency says past prices and volume are already reflected in current prices, so technical analysis alone can't reliably beat the market."
      },
      {
        q: "What is a 'call option'?",
        options: ["The right to sell an asset at a set price", "The right to buy an asset at a set price", "An obligation to buy a stock", "A type of bond redemption"],
        answer: 1,
        explain: "A call option gives the holder the right, but not the obligation, to buy the underlying asset at the strike price."
      },
      {
        q: "What does 'quantitative easing' primarily involve?",
        options: ["A central bank raising interest rates sharply", "A central bank buying assets to inject money into the economy", "A government cutting taxes", "Banks increasing reserve requirements"],
        answer: 1,
        explain: "Quantitative easing is when a central bank buys bonds or other assets to increase the money supply and lower long-term rates."
      },
      {
        q: "What is 'alpha' in investing?",
        options: ["The risk-free rate of return", "A measure of excess return relative to a benchmark", "A stock's total trading volume", "The first stock added to a portfolio"],
        answer: 1,
        explain: "Alpha measures how much better (or worse) an investment performed compared to its benchmark, after adjusting for risk."
      },
      {
        q: "What does a credit default swap (CDS) primarily do?",
        options: ["Insures against a borrower defaulting on debt", "Converts debt into equity", "Guarantees a fixed exchange rate", "Pools multiple mortgages into one bond"],
        answer: 0,
        explain: "A CDS acts like insurance: the buyer pays a premium and receives a payout if the underlying borrower defaults."
      }
    ]
   }
  }
};
