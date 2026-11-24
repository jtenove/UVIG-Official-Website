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
  "week": "2026-W48",
  "crossword": {
    "easy": {
      "title": "Portfolio Basics",
      "estimate": "~5 min",
      "words": [
        {
          "answer": "BONDS",
          "clue": "Loans to governments or companies that pay interest"
        },
        {
          "answer": "RISK",
          "clue": "The chance an investment loses value"
        },
        {
          "answer": "YIELD",
          "clue": "Income an investment pays, as a percentage of its price"
        },
        {
          "answer": "BULL",
          "clue": "A market where prices are rising"
        },
        {
          "answer": "BEAR",
          "clue": "A market where prices are falling"
        },
        {
          "answer": "ASSET",
          "clue": "Anything of value you own, like a stock or a property"
        },
        {
          "answer": "CASH",
          "clue": "Money in hand, the most liquid asset"
        },
        {
          "answer": "BUDGET",
          "clue": "A plan for how you will spend and save your money"
        },
        {
          "answer": "INTEREST",
          "clue": "The cost of borrowing money, or the reward for lending it"
        },
        {
          "answer": "SAVINGS",
          "clue": "Money set aside for later, often kept in an account"
        },
        {
          "answer": "RETURN",
          "clue": "The gain or loss on an investment over time"
        },
        {
          "answer": "MARKET",
          "clue": "Where buyers and sellers trade securities"
        }
      ]
    },
    "hard": {
      "title": "Finance Terms",
      "estimate": "~5 min",
      "words": [
        {
          "answer": "EQUITY",
          "clue": "Ownership interest in a company"
        },
        {
          "answer": "DIVIDEND",
          "clue": "A cash payout of profits to shareholders"
        },
        {
          "answer": "LIQUIDITY",
          "clue": "How easily an asset can be turned into cash without moving its price"
        },
        {
          "answer": "HEDGE",
          "clue": "A position taken to offset potential losses elsewhere"
        },
        {
          "answer": "ARBITRAGE",
          "clue": "Profiting from a price gap for the same asset in two markets"
        },
        {
          "answer": "LEVERAGE",
          "clue": "Using borrowed money to amplify potential returns"
        },
        {
          "answer": "BETA",
          "clue": "A measure of a stock's sensitivity to the overall market"
        },
        {
          "answer": "DEFLATION",
          "clue": "A broad, sustained fall in prices across an economy"
        },
        {
          "answer": "TRANCHE",
          "clue": "One slice of a structured debt offering"
        },
        {
          "answer": "DURATION",
          "clue": "A bond's sensitivity to changes in interest rates"
        },
        {
          "answer": "ALPHA",
          "clue": "Return earned above a benchmark"
        }
      ]
    }
  },
  "trivia": {
    "easy": {
      "title": "Market Trivia",
      "questions": [
        {
          "q": "What does 'diversification' mean?",
          "options": [
            "Putting all your money in one stock",
            "Spreading investments across different assets to reduce risk",
            "Selling everything when markets fall",
            "Only buying bonds"
          ],
          "answer": 1,
          "explain": "Diversifying means not relying on any single investment, so one bad result hurts your portfolio less."
        },
        {
          "q": "A 'bull market' is one where prices are generally...?",
          "options": [
            "Falling",
            "Flat",
            "Rising",
            "Closed for the holidays"
          ],
          "answer": 2,
          "explain": "A bull market is a sustained period of rising prices, usually alongside investor optimism."
        },
        {
          "q": "What is a dividend?",
          "options": [
            "A fee charged by your broker",
            "A share of company profits paid to shareholders",
            "A type of bond",
            "A tax on investment gains"
          ],
          "answer": 1,
          "explain": "Dividends are payments, usually in cash, that a company makes to its shareholders out of its profits."
        },
        {
          "q": "What does TFSA stand for?",
          "options": [
            "Total Financial Savings Account",
            "Tax-Free Savings Account",
            "Tiered Fund Security Agreement",
            "Trading Fund Services Authority"
          ],
          "answer": 1,
          "explain": "A TFSA is a Canadian account where investment growth and withdrawals are tax-free."
        },
        {
          "q": "The S&P 500 tracks roughly how many large U.S. companies?",
          "options": [
            "50",
            "100",
            "500",
            "5,000"
          ],
          "answer": 2,
          "explain": "The S&P 500 follows about 500 of the largest publicly traded companies in the United States."
        },
        {
          "q": "What does 'ETF' stand for?",
          "options": [
            "Equity Trading Fee",
            "Electronic Transfer Fund",
            "Exchange-Traded Fund",
            "Extended Term Fund"
          ],
          "answer": 2,
          "explain": "An ETF is a fund that holds a basket of assets and trades on an exchange like a single stock."
        },
        {
          "q": "Which of these is typically the lowest-risk investment?",
          "options": [
            "Government treasury bills",
            "Small-cap stocks",
            "Cryptocurrency",
            "Startup shares"
          ],
          "answer": 0,
          "explain": "Short-term government debt is considered one of the safest investments because governments rarely default."
        },
        {
          "q": "What is compound interest?",
          "options": [
            "Interest charged only on the original amount",
            "Interest earned on both your principal and past interest",
            "A fixed fee on every deposit",
            "Interest that stops after one year"
          ],
          "answer": 1,
          "explain": "Compounding means your earnings start earning too, which is why starting early matters."
        },
        {
          "q": "What does inflation do to purchasing power?",
          "options": [
            "Increases it",
            "Reduces it",
            "Leaves it unchanged",
            "Doubles it"
          ],
          "answer": 1,
          "explain": "When prices rise over time, each dollar buys less than before."
        },
        {
          "q": "What does 'TSX' stand for?",
          "options": [
            "Trading Standard Exchange",
            "Toronto Stock Exchange",
            "Total Securities Index",
            "Treasury Securities Exchange"
          ],
          "answer": 1,
          "explain": "The TSX is Canada's main stock exchange, based in Toronto."
        }
      ]
    },
    "hard": {
      "title": "Advanced Trivia",
      "questions": [
        {
          "q": "The price-to-earnings (P/E) ratio compares a stock's price to its...?",
          "options": [
            "Dividend yield",
            "Earnings per share",
            "Book value",
            "Trading volume"
          ],
          "answer": 1,
          "explain": "P/E shows how much investors pay for each dollar of a company's earnings."
        },
        {
          "q": "Which institution sets Canada's overnight interest rate target?",
          "options": [
            "Department of Finance",
            "Toronto Stock Exchange",
            "Bank of Canada",
            "Canada Revenue Agency"
          ],
          "answer": 2,
          "explain": "The Bank of Canada sets the target for the overnight rate, its main policy tool."
        },
        {
          "q": "An inverted yield curve, where short-term rates exceed long-term rates, has often signalled what?",
          "options": [
            "An upcoming recession",
            "A stock market boom",
            "Lower taxes",
            "Rising dividends"
          ],
          "answer": 0,
          "explain": "Inversions have frequently preceded recessions, which is why markets watch the curve closely."
        },
        {
          "q": "In options trading, what does owning a 'call' give you?",
          "options": [
            "The right to sell at a set price",
            "The right to buy at a set price",
            "An obligation to buy",
            "A guaranteed profit"
          ],
          "answer": 1,
          "explain": "A call option gives the holder the right, not the obligation, to buy an asset at the strike price."
        },
        {
          "q": "EBITDA stands for earnings before interest, taxes, depreciation and...?",
          "options": [
            "Amortization",
            "Allocation",
            "Arbitrage",
            "Accruals"
          ],
          "answer": 0,
          "explain": "EBITDA adds back amortization along with interest, taxes and depreciation to approximate operating performance."
        },
        {
          "q": "What does the Sharpe ratio measure?",
          "options": [
            "Dividend growth",
            "Risk-adjusted return",
            "Trading costs",
            "Company size"
          ],
          "answer": 1,
          "explain": "The Sharpe ratio shows how much return you earn per unit of risk taken."
        },
        {
          "q": "What is 'quantitative easing'?",
          "options": [
            "Raising interest rates sharply",
            "A central bank buying assets to add liquidity",
            "Cutting government spending",
            "A tax on bond trades"
          ],
          "answer": 1,
          "explain": "In quantitative easing, a central bank buys securities to lower long-term rates and support lending."
        },
        {
          "q": "The 'rule of 72' is a shortcut for estimating what?",
          "options": [
            "Annual tax owed",
            "How many years it takes an investment to double",
            "A stock's fair price",
            "Required retirement savings"
          ],
          "answer": 1,
          "explain": "Divide 72 by the annual return percentage to roughly estimate the years needed to double your money."
        },
        {
          "q": "Which ratio compares a company's total debt to its shareholders' equity?",
          "options": [
            "Current ratio",
            "Debt-to-equity",
            "Price-to-book",
            "Quick ratio"
          ],
          "answer": 1,
          "explain": "Debt-to-equity shows how much a company relies on borrowing versus owners' funds."
        },
        {
          "q": "What is a 'short squeeze'?",
          "options": [
            "A ban on short selling",
            "A rapid price rise that forces short sellers to buy back shares",
            "A fall in trading volume",
            "A tax on short-term gains"
          ],
          "answer": 1,
          "explain": "When a heavily shorted stock rises, short sellers rush to cover, which pushes the price up even further."
        }
      ]
    }
  }
};
