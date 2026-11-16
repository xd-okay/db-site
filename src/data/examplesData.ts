export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Boss';

export type ModuleId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

export interface ModuleInfo {
  id: ModuleId;
  num: string;
  title: string;
  subtitle: string;
}

export const MODULES: ModuleInfo[] = [
  { id: 'm1', num: 'M1', title: 'Basics', subtitle: 'COMMIT, ROLLBACK, Missing Accounts & Checks' },
  { id: 'm2', num: 'M2', title: 'Savepoints', subtitle: 'Checkpoints & Partial Rollbacks' },
  { id: 'm3', num: 'M3', title: 'Isolation', subtitle: 'Snapshots & Concurrent Reads' },
  { id: 'm4', num: 'M4', title: 'Locks', subtitle: 'Lost Updates & FOR UPDATE' },
  { id: 'm5', num: 'M5', title: 'Boss Lab', subtitle: 'Write Skew, Deadlocks & Safe Bookings' },
];

export interface AcidCardData {
  letter: string;
  title: string;
  tagline: string;
  accent: 'cyan' | 'emerald' | 'violet' | 'amber';
}

export const ACID_CARDS: AcidCardData[] = [
  { letter: 'A', title: 'Atomicity', tagline: 'All succeed, or all fail.', accent: 'cyan' },
  { letter: 'C', title: 'Consistency', tagline: 'Rules & constraints never break.', accent: 'emerald' },
  { letter: 'I', title: 'Isolation', tagline: 'Concurrent queries stay isolated.', accent: 'violet' },
  { letter: 'D', title: 'Durability', tagline: 'Committed data survives crashes.', accent: 'amber' },
];

export type CellTone = 'normal' | 'changed' | 'added' | 'error' | 'locked' | 'muted';

export interface ResultCell {
  value: string;
  tone?: CellTone;
}

export interface ResultTable {
  title: string;
  badge?: string;
  columns: string[];
  rows: ResultCell[][];
}

export interface ConsoleLine {
  text: string;
  tone: 'info' | 'success' | 'warn' | 'error';
}

export type TxBadge =
  | 'COMMITTED'
  | 'IN TX'
  | 'ROLLED BACK'
  | 'ABORTED'
  | 'SAVEPOINT'
  | 'LOCKED'
  | 'DEADLOCK'
  | 'SERIALIZATION ERR';

export interface DualWindowRow {
  step: number;
  windowA: string;
  windowB: string;
}

export interface ExampleStep {
  label: string;
  txBadge: TxBadge;
  /** 1-based line numbers for single-editor examples */
  highlightLines?: number[];
  /** 1-based step index for dual-window examples */
  activeDualStep?: number;
  tables: ResultTable[];
  console: ConsoleLine[];
}

export interface LessonExample {
  id: number;
  code: string;
  module: ModuleId;
  difficulty: Difficulty;
  tag: string;
  title: string;
  hint: string;
  expect: string;
  filename: string;
  mode: 'single' | 'dual';
  sql?: string;
  dualRows?: DualWindowRow[];
  resetSql?: string;
  steps: ExampleStep[];
}

export const SETUP_SCHEMA_SQL = `-- Run once in a disposable practice database
DROP SCHEMA IF EXISTS txlab CASCADE;
CREATE SCHEMA txlab;
SET search_path TO txlab;

-- Bank accounts & balances
CREATE TABLE accounts (
  id INT PRIMARY KEY,
  name TEXT,
  balance INT NOT NULL CHECK (balance >= 0)
);
INSERT INTO accounts VALUES
  (1, 'Alice', 100),
  (2, 'Bob', 100),
  (3, 'Charlie', 50);

-- Pizza shop inventory
CREATE TABLE snacks (
  id INT PRIMARY KEY,
  item TEXT,
  stock INT CHECK (stock >= 0)
);
INSERT INTO snacks VALUES (1, 'Pizza', 5);

CREATE TABLE orders (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer TEXT,
  item TEXT,
  quantity INT CHECK (quantity > 0)
);

-- Cafe table reservations
CREATE TABLE cafe_tables (
  table_no INT PRIMARY KEY,
  status TEXT,
  reserved_by TEXT
);
INSERT INTO cafe_tables VALUES (1, 'AVAILABLE', NULL);

-- Office night shift guards
CREATE TABLE guards (
  id INT PRIMARY KEY,
  on_duty BOOLEAN
);
INSERT INTO guards VALUES (1, TRUE), (2, TRUE);

-- Concert tickets
CREATE TABLE shows (
  id INT PRIMARY KEY,
  seats_left INT CHECK (seats_left >= 0)
);
INSERT INTO shows VALUES (1, 1);

CREATE TABLE bookings (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  show_id INT REFERENCES shows(id),
  guest TEXT
);`;

export const EXAMPLES: LessonExample[] = [
  // ===================== MODULE 01: BASICS (4 EXAMPLES) =====================
  {
    id: 1,
    code: '01',
    module: 'm1',
    difficulty: 'Easy',
    tag: 'Bank Transfer',
    title: 'BEGIN + COMMIT — Alice Pays Bob for Lunch',
    hint: 'BEGIN groups statements into one unit. COMMIT saves both changes permanently together.',
    expect: 'Alice balance = 80, Bob balance = 120. The money cleanly moved between both accounts.',
    filename: '01_pay_for_lunch.sql',
    mode: 'single',
    sql: `BEGIN;

-- Alice transfers $20 to Bob for lunch
UPDATE accounts
SET balance = balance - 20
WHERE id = 1;

UPDATE accounts
SET balance = balance + 20
WHERE id = 2;

COMMIT;
SELECT id, name, balance FROM accounts ORDER BY id;`,
    steps: [
      {
        label: 'BEGIN',
        txBadge: 'IN TX',
        highlightLines: [1],
        tables: [
          {
            title: 'accounts',
            columns: ['id', 'name', 'balance'],
            rows: [
              [{ value: '1' }, { value: 'Alice' }, { value: '$100' }],
              [{ value: '2' }, { value: 'Bob' }, { value: '$100' }],
            ],
          },
        ],
        console: [{ text: 'BEGIN', tone: 'info' }],
      },
      {
        label: 'Alice -$20',
        txBadge: 'IN TX',
        highlightLines: [3, 4, 5, 6],
        tables: [
          {
            title: 'accounts',
            badge: 'UNCOMMITTED',
            columns: ['id', 'name', 'balance'],
            rows: [
              [{ value: '1' }, { value: 'Alice' }, { value: '$80 (-20)', tone: 'changed' }],
              [{ value: '2' }, { value: 'Bob' }, { value: '$100' }],
            ],
          },
        ],
        console: [{ text: 'UPDATE 1  -- uncommitted, only visible in this session', tone: 'warn' }],
      },
      {
        label: 'Bob +$20',
        txBadge: 'IN TX',
        highlightLines: [8, 9, 10],
        tables: [
          {
            title: 'accounts',
            badge: 'UNCOMMITTED',
            columns: ['id', 'name', 'balance'],
            rows: [
              [{ value: '1' }, { value: 'Alice' }, { value: '$80', tone: 'changed' }],
              [{ value: '2' }, { value: 'Bob' }, { value: '$120 (+20)', tone: 'changed' }],
            ],
          },
        ],
        console: [{ text: 'UPDATE 1  -- both changes staged together', tone: 'warn' }],
      },
      {
        label: 'COMMIT',
        txBadge: 'COMMITTED',
        highlightLines: [12, 13],
        tables: [
          {
            title: 'accounts',
            badge: 'SAVED',
            columns: ['id', 'name', 'balance'],
            rows: [
              [{ value: '1' }, { value: 'Alice' }, { value: '$80', tone: 'added' }],
              [{ value: '2' }, { value: 'Bob' }, { value: '$120', tone: 'added' }],
              [{ value: '3' }, { value: 'Charlie' }, { value: '$50' }],
            ],
          },
        ],
        console: [
          { text: 'COMMIT', tone: 'success' },
          { text: 'Transfer completed successfully!', tone: 'info' },
        ],
      },
    ],
  },

  {
    id: 2,
    code: '02',
    module: 'm1',
    difficulty: 'Easy',
    tag: 'Undo Transfer',
    title: 'ROLLBACK — Buyer Cancels at Checkout',
    hint: 'ROLLBACK cancels all changes made since BEGIN, leaving the database exactly as it was.',
    expect: 'Alice temporarily sees $80 during checkout, but cancels before payment. Balance returns to $100.',
    filename: '02_cancel_checkout.sql',
    mode: 'single',
    sql: `BEGIN;

-- Alice starts checkout for a $20 hoodie
UPDATE accounts SET balance = balance - 20 WHERE id = 1;
SELECT name, balance FROM accounts WHERE id = 1; -- $80

ROLLBACK; -- User clicked "Cancel Order"

SELECT name, balance FROM accounts WHERE id = 1; -- $100 restored!`,
    steps: [
      {
        label: 'Debit -$20',
        txBadge: 'IN TX',
        highlightLines: [1, 3, 4, 5],
        tables: [
          {
            title: 'accounts (inside transaction)',
            badge: 'TEMPORARY',
            columns: ['id', 'name', 'balance'],
            rows: [[{ value: '1' }, { value: 'Alice' }, { value: '$80 (-20)', tone: 'changed' }]],
          },
        ],
        console: [
          { text: 'BEGIN', tone: 'info' },
          { text: 'UPDATE 1', tone: 'warn' },
          { text: 'SELECT -> Alice | $80', tone: 'info' },
        ],
      },
      {
        label: 'ROLLBACK',
        txBadge: 'ROLLED BACK',
        highlightLines: [7, 9],
        tables: [
          {
            title: 'accounts (after cancel)',
            badge: 'REVERTED',
            columns: ['id', 'name', 'balance'],
            rows: [[{ value: '1' }, { value: 'Alice' }, { value: '$100', tone: 'normal' }]],
          },
        ],
        console: [
          { text: 'ROLLBACK -- order canceled cleanly', tone: 'error' },
          { text: 'SELECT -> Alice | $100 restored', tone: 'success' },
        ],
      },
    ],
  },

  {
    id: 3,
    code: '03',
    module: 'm1',
    difficulty: 'Easy',
    tag: 'Silent Trap',
    title: 'UPDATE 0 — Transferring to a Typo Account Number',
    hint: 'Matching 0 rows is NOT a database error! The app must check row counts, otherwise money vanishes.',
    expect: 'App catches that account 999 got 0 updates and calls ROLLBACK. No money is lost.',
    filename: '03_typo_account_trap.sql',
    mode: 'single',
    sql: `BEGIN;

-- Alice sends $10
UPDATE accounts SET balance = balance - 10 WHERE id = 1;
-- UPDATE 1 (Alice loses $10)

-- Typo in recipient account ID!
UPDATE accounts SET balance = balance + 10 WHERE id = 999;
-- UPDATE 0 (Nobody received the money!)

ROLLBACK; -- Critical: abort so $10 doesn't vanish into thin air!`,
    steps: [
      {
        label: 'Alice -$10',
        txBadge: 'IN TX',
        highlightLines: [1, 3, 4, 5],
        tables: [
          {
            title: 'accounts',
            columns: ['id', 'name', 'balance'],
            rows: [
              [{ value: '1' }, { value: 'Alice' }, { value: '$90 (-10)', tone: 'changed' }],
              [{ value: '2' }, { value: 'Bob' }, { value: '$100' }],
            ],
          },
        ],
        console: [{ text: 'UPDATE 1  -- 1 row matched', tone: 'warn' }],
      },
      {
        label: 'Account 999 (0 rows!)',
        txBadge: 'IN TX',
        highlightLines: [7, 8, 9],
        tables: [
          {
            title: 'accounts',
            badge: 'MONEY IN LIMBO',
            columns: ['id', 'name', 'balance'],
            rows: [
              [{ value: '1' }, { value: 'Alice' }, { value: '$90', tone: 'error' }],
              [{ value: '999', tone: 'muted' }, { value: '(not found)', tone: 'error' }, { value: '0 rows updated', tone: 'error' }],
            ],
          },
        ],
        console: [
          { text: 'UPDATE 0  -- NO SQL ERROR! But 0 rows were updated.', tone: 'error' },
        ],
      },
      {
        label: 'ROLLBACK',
        txBadge: 'ROLLED BACK',
        highlightLines: [11],
        tables: [
          {
            title: 'accounts',
            badge: 'SAFE',
            columns: ['id', 'name', 'balance'],
            rows: [
              [{ value: '1' }, { value: 'Alice' }, { value: '$100', tone: 'added' }],
              [{ value: '2' }, { value: 'Bob' }, { value: '$100' }],
            ],
          },
        ],
        console: [
          { text: 'ROLLBACK -- app checked rowcount == 0 and refunded Alice!', tone: 'success' },
        ],
      },
    ],
  },

  {
    id: 4,
    code: '04',
    module: 'm1',
    difficulty: 'Easy',
    tag: 'Constraint Guard',
    title: 'Atomicity & CHECK — Over-Ordering Pizzas',
    hint: 'CHECK (stock >= 0) stops negative stock. If one query fails, the entire transaction aborts.',
    expect: 'Trying to buy 50 pizzas when only 5 exist raises an error. The order row is discarded too.',
    filename: '04_pizza_stock_check.sql',
    mode: 'single',
    sql: `-- Rule: stock INT CHECK (stock >= 0)  [Current stock: 5]
BEGIN;

INSERT INTO orders (customer, item, quantity)
VALUES ('Office Party', 'Pizza', 50);

-- Try to take 50 pizzas when only 5 exist
UPDATE snacks
SET stock = stock - 50
WHERE item = 'Pizza';
-- ERROR: violates check constraint "snacks_stock_check"

COMMIT; -- Auto-aborted by Postgres -> triggers ROLLBACK!`,
    steps: [
      {
        label: 'Stage Order (50x)',
        txBadge: 'IN TX',
        highlightLines: [2, 4, 5],
        tables: [
          {
            title: 'orders',
            badge: 'STAGED',
            columns: ['customer', 'item', 'quantity'],
            rows: [[{ value: 'Office Party', tone: 'added' }, { value: 'Pizza' }, { value: '50' }]],
          },
          {
            title: 'snacks',
            columns: ['item', 'stock'],
            rows: [[{ value: 'Pizza' }, { value: '5' }]],
          },
        ],
        console: [{ text: 'INSERT 0 1 -- staged inside transaction', tone: 'warn' }],
      },
      {
        label: 'CHECK (stock >= 0) Fails',
        txBadge: 'ABORTED',
        highlightLines: [7, 8, 9, 10, 11],
        tables: [
          {
            title: 'orders',
            badge: 'ABORTED',
            columns: ['customer', 'item', 'quantity'],
            rows: [[{ value: 'Office Party', tone: 'error' }, { value: 'Pizza', tone: 'error' }, { value: '50 (will undo)', tone: 'error' }]],
          },
          {
            title: 'snacks',
            badge: 'BLOCKED',
            columns: ['item', 'stock'],
            rows: [[{ value: 'Pizza' }, { value: '5 (5 - 50 = -45!)', tone: 'error' }]],
          },
        ],
        console: [
          { text: 'ERROR: new row violates check constraint "snacks_stock_check"', tone: 'error' },
          { text: 'DETAIL: Failing row contains (Pizza, -45). Only 5 left in stock!', tone: 'error' },
        ],
      },
      {
        label: 'Auto ROLLBACK',
        txBadge: 'ROLLED BACK',
        highlightLines: [13],
        tables: [
          {
            title: 'orders',
            badge: 'WIPED (ATOMIC)',
            columns: ['customer', 'item', 'quantity'],
            rows: [[{ value: '(0 rows)', tone: 'muted' }, { value: '—', tone: 'muted' }, { value: '—', tone: 'muted' }]],
          },
          {
            title: 'snacks',
            badge: 'INTACT',
            columns: ['item', 'stock'],
            rows: [[{ value: 'Pizza' }, { value: '5', tone: 'added' }]],
          },
        ],
        console: [
          { text: 'WARNING: current transaction is aborted, commands ignored until end of transaction block', tone: 'warn' },
          { text: 'ROLLBACK -- zero partial state preserved', tone: 'error' },
        ],
      },
    ],
  },

  // ===================== MODULE 02: SAVEPOINTS (2 EXAMPLES) =====================
  {
    id: 5,
    code: '05',
    module: 'm2',
    difficulty: 'Medium',
    tag: 'Coffee Shop Checkpoint',
    title: 'SAVEPOINT — Keep the Coffee, Cancel the Cake',
    hint: 'SAVEPOINT sets a checkpoint. You can roll back only the mistake without losing earlier work.',
    expect: 'The coffee order is kept, the out-of-stock cheesecake is undone, and the transaction commits.',
    filename: '05_coffee_savepoint.sql',
    mode: 'single',
    sql: `BEGIN;

-- Order 1: Large Latte
INSERT INTO orders (customer, item, quantity)
VALUES ('Sarah', 'Large Latte', 1);

SAVEPOINT before_pastry;

-- Order 2: Try to order Cheesecake (oops, sold out!)
INSERT INTO orders (customer, item, quantity)
VALUES ('Sarah', 'Cheesecake', 1);

-- Cancel just the cake:
ROLLBACK TO SAVEPOINT before_pastry;

COMMIT; -- Latte is saved, Cheesecake was removed!`,
    steps: [
      {
        label: 'Buy Latte',
        txBadge: 'IN TX',
        highlightLines: [1, 3, 4, 5],
        tables: [
          {
            title: 'orders',
            columns: ['customer', 'item', 'quantity'],
            rows: [[{ value: 'Sarah', tone: 'added' }, { value: 'Large Latte', tone: 'added' }, { value: '1' }]],
          },
        ],
        console: [{ text: 'INSERT 0 1 -- Latte added to order', tone: 'info' }],
      },
      {
        label: 'SAVEPOINT + Cheesecake',
        txBadge: 'SAVEPOINT',
        highlightLines: [7, 9, 10, 11],
        tables: [
          {
            title: 'orders',
            badge: 'CHECKPOINT CREATED',
            columns: ['customer', 'item', 'quantity'],
            rows: [
              [{ value: 'Sarah' }, { value: 'Large Latte' }, { value: '1' }],
              [{ value: 'Sarah', tone: 'error' }, { value: 'Cheesecake (Sold out!)', tone: 'error' }, { value: '1' }],
            ],
          },
        ],
        console: [
          { text: 'SAVEPOINT before_pastry', tone: 'info' },
          { text: 'INSERT 0 1 -- Customer changes mind on cake', tone: 'warn' },
        ],
      },
      {
        label: 'ROLLBACK TO + COMMIT',
        txBadge: 'COMMITTED',
        highlightLines: [13, 15],
        tables: [
          {
            title: 'orders',
            badge: 'SAVED',
            columns: ['customer', 'item', 'quantity'],
            rows: [[{ value: 'Sarah', tone: 'added' }, { value: 'Large Latte', tone: 'added' }, { value: '1' }]],
          },
        ],
        console: [
          { text: 'ROLLBACK TO SAVEPOINT before_pastry -- cake erased', tone: 'warn' },
          { text: 'COMMIT -- Sarah gets her Latte without having to re-order!', tone: 'success' },
        ],
      },
    ],
  },

  {
    id: 6,
    code: '06',
    module: 'm2',
    difficulty: 'Medium',
    tag: 'Error Recovery',
    title: 'Duplicate ID Error — Repair with SAVEPOINT',
    hint: 'A failed statement normally locks the transaction. ROLLBACK TO SAVEPOINT repairs the abort state.',
    expect: 'Inserting duplicate ID 1 causes an error, but SAVEPOINT rescues the transaction so Bob still gets +$10.',
    filename: '06_duplicate_id_repair.sql',
    mode: 'single',
    sql: `BEGIN;

SAVEPOINT before_insert;

-- Try inserting someone with an existing ID 1
INSERT INTO accounts (id, name, balance)
VALUES (1, 'Alice Clone', 500);
-- ERROR: duplicate key value violates unique constraint (id=1)

-- Rescue the transaction from the aborted state!
ROLLBACK TO SAVEPOINT before_insert;

-- Continue normal business:
UPDATE accounts SET balance = balance + 10 WHERE id = 2;
COMMIT;`,
    steps: [
      {
        label: 'Duplicate Key Error',
        txBadge: 'ABORTED',
        highlightLines: [1, 3, 5, 6, 7],
        tables: [
          {
            title: 'accounts',
            badge: 'ERROR TRIGGERED',
            columns: ['id', 'name', 'balance'],
            rows: [
              [{ value: '1' }, { value: 'Alice' }, { value: '$100' }],
              [{ value: '1 (duplicate)', tone: 'error' }, { value: 'Alice Clone', tone: 'error' }, { value: '$500 (rejected)', tone: 'error' }],
            ],
          },
        ],
        console: [
          { text: 'SAVEPOINT before_insert', tone: 'info' },
          { text: 'ERROR: duplicate key value violates unique constraint "accounts_pkey"', tone: 'error' },
        ],
      },
      {
        label: 'Repair + Bob +$10',
        txBadge: 'COMMITTED',
        highlightLines: [10, 13, 14],
        tables: [
          {
            title: 'accounts',
            badge: 'COMMITTED',
            columns: ['id', 'name', 'balance'],
            rows: [
              [{ value: '1' }, { value: 'Alice (untouched)' }, { value: '$100' }],
              [{ value: '2' }, { value: 'Bob' }, { value: '$110 (+$10)', tone: 'added' }],
            ],
          },
        ],
        console: [
          { text: 'ROLLBACK TO SAVEPOINT -- transaction repaired!', tone: 'warn' },
          { text: 'UPDATE 1 -- Bob gets +$10', tone: 'info' },
          { text: 'COMMIT -- successfully finished', tone: 'success' },
        ],
      },
    ],
  },

  // ===================== MODULE 03: ISOLATION (3 EXAMPLES) =====================
  {
    id: 7,
    code: '07',
    module: 'm3',
    difficulty: 'Medium',
    tag: 'Configuration',
    title: 'Checking & Setting Isolation Levels',
    hint: 'Configure the isolation level before the first query. In Postgres, the default is READ COMMITTED.',
    expect: 'SHOW reports the chosen isolation level inside the block, then reverts back to default after COMMIT.',
    filename: '07_set_isolation_level.sql',
    mode: 'single',
    sql: `SHOW transaction_isolation; -- read committed (default)

BEGIN;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SHOW transaction_isolation; -- repeatable read
COMMIT;

SHOW transaction_isolation; -- automatically back to read committed
-- Shorthand: BEGIN ISOLATION LEVEL SERIALIZABLE;`,
    steps: [
      {
        label: 'Inside Transaction',
        txBadge: 'IN TX',
        highlightLines: [3, 4, 5],
        tables: [
          {
            title: 'SHOW transaction_isolation',
            columns: ['transaction_isolation'],
            rows: [[{ value: 'repeatable read', tone: 'changed' }]],
          },
        ],
        console: [
          { text: 'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ', tone: 'info' },
          { text: 'SHOW -> repeatable read', tone: 'success' },
        ],
      },
      {
        label: 'After COMMIT',
        txBadge: 'COMMITTED',
        highlightLines: [6, 8],
        tables: [
          {
            title: 'SHOW transaction_isolation',
            columns: ['transaction_isolation'],
            rows: [[{ value: 'read committed (session default)', tone: 'normal' }]],
          },
        ],
        console: [
          { text: 'COMMIT', tone: 'success' },
          { text: 'SHOW -> read committed', tone: 'info' },
        ],
      },
    ],
  },

  {
    id: 8,
    code: '08',
    module: 'm3',
    difficulty: 'Medium',
    tag: '2 Windows · Non-Repeatable Read',
    title: 'READ COMMITTED — Balance Changes Mid-Session',
    hint: 'At READ COMMITTED, each SELECT takes a fresh snapshot. Another committed transaction changes what you see.',
    expect: 'Window A queries Alice: gets $100. Window B deposits $100 and commits. Window A queries again: gets $200!',
    filename: '08_read_committed_shift.sql',
    mode: 'dual',
    resetSql: `UPDATE accounts SET balance = 100 WHERE id = 1;`,
    dualRows: [
      {
        step: 1,
        windowA: `BEGIN ISOLATION LEVEL READ COMMITTED;\nSELECT balance FROM accounts WHERE id = 1; -- $100`,
        windowB: `-- idle`,
      },
      {
        step: 2,
        windowA: `-- still inside transaction...`,
        windowB: `UPDATE accounts SET balance = 200 WHERE id = 1;\n-- autocommitted!`,
      },
      {
        step: 3,
        windowA: `SELECT balance FROM accounts WHERE id = 1; -- $200!\nCOMMIT;`,
        windowB: `-- done`,
      },
    ],
    steps: [
      {
        label: 'Step 1 (Window A reads)',
        txBadge: 'IN TX',
        activeDualStep: 1,
        tables: [
          {
            title: 'Window A View',
            columns: ['name', 'balance'],
            rows: [[{ value: 'Alice' }, { value: '$100' }]],
          },
        ],
        console: [{ text: 'Window A: SELECT -> Alice has $100', tone: 'info' }],
      },
      {
        label: 'Step 2 (Window B deposits)',
        txBadge: 'IN TX',
        activeDualStep: 2,
        tables: [
          {
            title: 'Database State (B committed)',
            columns: ['name', 'balance'],
            rows: [[{ value: 'Alice' }, { value: '$200 (updated by B)', tone: 'changed' }]],
          },
        ],
        console: [{ text: 'Window B: UPDATE accounts SET balance = 200 (autocommitted)', tone: 'warn' }],
      },
      {
        label: 'Step 3 (Window A re-reads)',
        txBadge: 'COMMITTED',
        activeDualStep: 3,
        tables: [
          {
            title: 'Window A Reads Comparison',
            badge: 'CHANGED MID-TRANSACTION',
            columns: ['query', 'balance_seen'],
            rows: [
              [{ value: '1st SELECT' }, { value: '$100' }],
              [{ value: '2nd SELECT' }, { value: '$200', tone: 'error' }],
            ],
          },
        ],
        console: [
          { text: 'Window A: SELECT -> $200 (Non-repeatable read occurred!)', tone: 'error' },
          { text: 'Window A: COMMIT', tone: 'success' },
        ],
      },
    ],
  },

  {
    id: 9,
    code: '09',
    module: 'm3',
    difficulty: 'Hard',
    tag: '2 Windows · Snapshot Freeze',
    title: 'REPEATABLE READ — Frozen Consistent View',
    hint: 'REPEATABLE READ freezes the snapshot at the first query. Changes made by others remain invisible.',
    expect: 'Window A reads $100 twice, even though Window B updated the real database to $200 in the background.',
    filename: '09_repeatable_read_freeze.sql',
    mode: 'dual',
    resetSql: `UPDATE accounts SET balance = 100 WHERE id = 1;`,
    dualRows: [
      {
        step: 1,
        windowA: `BEGIN ISOLATION LEVEL REPEATABLE READ;\nSELECT balance FROM accounts WHERE id = 1; -- $100`,
        windowB: `-- idle`,
      },
      {
        step: 2,
        windowA: `-- snapshot is now frozen`,
        windowB: `UPDATE accounts SET balance = 200 WHERE id = 1;\n-- autocommitted!`,
      },
      {
        step: 3,
        windowA: `SELECT balance FROM accounts WHERE id = 1; -- still $100!\nCOMMIT;`,
        windowB: `-- done`,
      },
    ],
    steps: [
      {
        label: 'Step 1 (Snapshot taken)',
        txBadge: 'IN TX',
        activeDualStep: 1,
        tables: [
          {
            title: 'Window A Snapshot',
            columns: ['name', 'balance'],
            rows: [[{ value: 'Alice' }, { value: '$100' }]],
          },
        ],
        console: [{ text: 'Window A: Snapshot frozen at balance = $100', tone: 'info' }],
      },
      {
        label: 'Step 2 (B writes $200)',
        txBadge: 'IN TX',
        activeDualStep: 2,
        tables: [
          {
            title: 'Actual DB vs Window A Snapshot',
            columns: ['view', 'balance'],
            rows: [
              [{ value: 'Real DB (B committed)' }, { value: '$200', tone: 'changed' }],
              [{ value: 'Window A Snapshot' }, { value: '$100 (frozen)', tone: 'added' }],
            ],
          },
        ],
        console: [{ text: 'Window B: UPDATE balance = 200 (committed)', tone: 'warn' }],
      },
      {
        label: 'Step 3 (A re-reads $100)',
        txBadge: 'COMMITTED',
        activeDualStep: 3,
        tables: [
          {
            title: 'Window A Reads Comparison',
            badge: '100% REPEATABLE',
            columns: ['query', 'balance_seen'],
            rows: [
              [{ value: '1st SELECT' }, { value: '$100', tone: 'added' }],
              [{ value: '2nd SELECT' }, { value: '$100', tone: 'added' }],
            ],
          },
        ],
        console: [
          { text: 'Window A: SELECT -> $100 (Consistent snapshot preserved!)', tone: 'success' },
          { text: 'Window A: COMMIT', tone: 'success' },
        ],
      },
    ],
  },

  // ===================== MODULE 04: LOCKS (2 EXAMPLES) =====================
  {
    id: 10,
    code: '10',
    module: 'm4',
    difficulty: 'Hard',
    tag: '2 Windows · Race Condition',
    title: 'The Lost Update — Two Cashiers Withdraw Simultaneously',
    hint: 'Both read $100 and do local math in code. The second UPDATE overwrites the first one without knowing!',
    expect: 'Final balance is $80 instead of $50 ($100 - $30 - $20). $30 was silently lost!',
    filename: '10_lost_update_race.sql',
    mode: 'dual',
    resetSql: `UPDATE accounts SET balance = 100 WHERE id = 1;`,
    dualRows: [
      {
        step: 1,
        windowA: `BEGIN;\nSELECT balance FROM accounts WHERE id = 1; -- reads $100`,
        windowB: `BEGIN;\nSELECT balance FROM accounts WHERE id = 1; -- reads $100`,
      },
      {
        step: 2,
        windowA: `-- App computes: 100 - 30 = 70\nUPDATE accounts SET balance = 70 WHERE id = 1;\nCOMMIT;`,
        windowB: `-- still holding stale 100 in memory...`,
      },
      {
        step: 3,
        windowA: `-- done`,
        windowB: `-- App computes: 100 - 20 = 80\nUPDATE accounts SET balance = 80 WHERE id = 1;\nCOMMIT;`,
      },
    ],
    steps: [
      {
        label: 'Step 1 (Both read $100)',
        txBadge: 'IN TX',
        activeDualStep: 1,
        tables: [
          {
            title: 'Both sessions hold stale $100',
            columns: ['cashier', 'read_balance', 'withdrawal'],
            rows: [
              [{ value: 'Cashier A' }, { value: '$100' }, { value: '-$30' }],
              [{ value: 'Cashier B' }, { value: '$100' }, { value: '-$20' }],
            ],
          },
        ],
        console: [
          { text: 'Cashier A: reads $100', tone: 'info' },
          { text: 'Cashier B: reads $100', tone: 'info' },
        ],
      },
      {
        label: 'Step 2 (A saves $70)',
        txBadge: 'IN TX',
        activeDualStep: 2,
        tables: [
          {
            title: 'accounts',
            columns: ['id', 'name', 'balance'],
            rows: [[{ value: '1' }, { value: 'Alice' }, { value: '$70', tone: 'changed' }]],
          },
        ],
        console: [{ text: 'Cashier A: UPDATE balance = 70; COMMIT;', tone: 'warn' }],
      },
      {
        label: 'Step 3 (B overwrites with $80!)',
        txBadge: 'COMMITTED',
        activeDualStep: 3,
        tables: [
          {
            title: 'accounts (BUG OCCURRED)',
            badge: 'LOST UPDATE',
            columns: ['id', 'name', 'actual_balance', 'correct_math'],
            rows: [
              [
                { value: '1' },
                { value: 'Alice' },
                { value: '$80', tone: 'error' },
                { value: '$50 ($100 - 30 - 20)', tone: 'added' },
              ],
            ],
          },
        ],
        console: [
          { text: 'Cashier B: UPDATE balance = 80; COMMIT; -- Cashier A’s -$30 was overwritten!', tone: 'error' },
        ],
      },
    ],
  },

  {
    id: 11,
    code: '11',
    module: 'm4',
    difficulty: 'Hard',
    tag: 'Row Locking',
    title: 'FOR UPDATE — Booking the Last Window Table at a Cafe',
    hint: 'SELECT ... FOR UPDATE locks the row. Customer 2 is paused until Customer 1 finishes or cancels.',
    expect: 'Customer 1 locks Table 1 first. Customer 2 unblocks only after Customer 1 commits and sees it is taken.',
    filename: '11_lock_cafe_table.sql',
    mode: 'dual',
    resetSql: `UPDATE cafe_tables SET status = 'AVAILABLE', reserved_by = NULL WHERE table_no = 1;`,
    dualRows: [
      {
        step: 1,
        windowA: `BEGIN;\nSELECT status FROM cafe_tables\nWHERE table_no = 1 FOR UPDATE; -- 'AVAILABLE'`,
        windowB: `-- idle`,
      },
      {
        step: 2,
        windowA: `-- Customer 1 is filling out phone number...`,
        windowB: `BEGIN;\nSELECT status FROM cafe_tables\nWHERE table_no = 1 FOR UPDATE;\n-- WAITING FOR CUSTOMER 1...`,
      },
      {
        step: 3,
        windowA: `UPDATE cafe_tables SET status = 'BOOKED', reserved_by = 'Customer 1'\nWHERE table_no = 1;\nCOMMIT;`,
        windowB: `-- UNBLOCKS: sees status = 'BOOKED'!\nROLLBACK;`,
      },
    ],
    steps: [
      {
        label: 'Step 1 (Customer 1 locks table)',
        txBadge: 'LOCKED',
        activeDualStep: 1,
        tables: [
          {
            title: 'cafe_tables',
            badge: 'ROW LOCKED BY C1',
            columns: ['table_no', 'status', 'reserved_by'],
            rows: [[{ value: 'Table 1', tone: 'locked' }, { value: 'AVAILABLE' }, { value: 'NULL' }]],
          },
        ],
        console: [{ text: 'Customer 1: FOR UPDATE row lock acquired on Table 1', tone: 'success' }],
      },
      {
        label: 'Step 2 (Customer 2 paused in queue)',
        txBadge: 'LOCKED',
        activeDualStep: 2,
        tables: [
          {
            title: 'cafe_tables + Lock Queue',
            badge: 'C2 QUEUED',
            columns: ['table_no', 'status', 'lock_holder', 'waiting_in_line'],
            rows: [
              [
                { value: 'Table 1', tone: 'locked' },
                { value: 'AVAILABLE' },
                { value: 'Customer 1', tone: 'added' },
                { value: 'Customer 2 (waiting...)', tone: 'changed' },
              ],
            ],
          },
        ],
        console: [
          { text: 'Customer 2: Query paused — waiting for Table 1 lock to be released...', tone: 'warn' },
        ],
      },
      {
        label: 'Step 3 (C1 commits, C2 sees BOOKED)',
        txBadge: 'COMMITTED',
        activeDualStep: 3,
        tables: [
          {
            title: 'cafe_tables',
            badge: 'RESERVED SAFELY',
            columns: ['table_no', 'status', 'reserved_by'],
            rows: [
              [
                { value: 'Table 1' },
                { value: 'BOOKED', tone: 'added' },
                { value: 'Customer 1', tone: 'added' },
              ],
            ],
          },
        ],
        console: [
          { text: 'Customer 1: COMMIT -- reservation confirmed', tone: 'success' },
          { text: 'Customer 2: Unblocked -> sees Table 1 is now BOOKED (no double-booking!)', tone: 'info' },
        ],
      },
    ],
  },

  // ===================== MODULE 05: BOSS LAB (4 EXAMPLES) =====================
  {
    id: 12,
    code: '12',
    module: 'm5',
    difficulty: 'Boss',
    tag: '2 Windows · Write Skew',
    title: 'SERIALIZABLE — Someone Must Guard the Office',
    hint: 'Rule: At least 1 guard must stay on duty. Under SERIALIZABLE, Postgres detects cross-row conflict and aborts one.',
    expect: 'Both try to leave at the same second. Postgres detects serialization anomaly (SQLSTATE 40001) and cancels one.',
    filename: '12_office_guard_duty.sql',
    mode: 'dual',
    resetSql: `UPDATE guards SET on_duty = TRUE;`,
    dualRows: [
      {
        step: 1,
        windowA: `BEGIN ISOLATION LEVEL SERIALIZABLE;\nSELECT count(*) FROM guards WHERE on_duty; -- 2 on duty`,
        windowB: `BEGIN ISOLATION LEVEL SERIALIZABLE;\nSELECT count(*) FROM guards WHERE on_duty; -- 2 on duty`,
      },
      {
        step: 2,
        windowA: `-- Guard 1 signs off\nUPDATE guards SET on_duty = FALSE WHERE id = 1;`,
        windowB: `-- Guard 2 signs off\nUPDATE guards SET on_duty = FALSE WHERE id = 2;`,
      },
      {
        step: 3,
        windowA: `COMMIT; -- succeeds!`,
        windowB: `COMMIT; -- ERROR 40001: could not serialize access!`,
      },
    ],
    steps: [
      {
        label: 'Step 1 (Both see 2 guards)',
        txBadge: 'IN TX',
        activeDualStep: 1,
        tables: [
          {
            title: 'guards',
            columns: ['id', 'on_duty'],
            rows: [
              [{ value: '1 (Guard 1)' }, { value: 'TRUE', tone: 'added' }],
              [{ value: '2 (Guard 2)' }, { value: 'TRUE', tone: 'added' }],
            ],
          },
        ],
        console: [{ text: 'Both guards see count(*) = 2. Safe to leave? Both think so!', tone: 'info' }],
      },
      {
        label: 'Step 2 (Different rows updated)',
        txBadge: 'IN TX',
        activeDualStep: 2,
        tables: [
          {
            title: 'Uncommitted intent',
            columns: ['guard_id', 'window_a', 'window_b'],
            rows: [
              [{ value: 'Guard 1' }, { value: 'FALSE (wants off)', tone: 'changed' }, { value: 'TRUE' }],
              [{ value: 'Guard 2' }, { value: 'TRUE' }, { value: 'FALSE (wants off)', tone: 'changed' }],
            ],
          },
        ],
        console: [{ text: 'No row lock collision because they edit different rows!', tone: 'warn' }],
      },
      {
        label: 'Step 3 (Postgres catches 40001)',
        txBadge: 'SERIALIZATION ERR',
        activeDualStep: 3,
        tables: [
          {
            title: 'guards (Office Protected!)',
            badge: 'WRITE SKEW PREVENTED',
            columns: ['id', 'on_duty'],
            rows: [
              [{ value: 'Guard 1' }, { value: 'FALSE (Clocked out)' }],
              [{ value: 'Guard 2' }, { value: 'TRUE (Transaction aborted, stays on duty!)', tone: 'added' }],
            ],
          },
        ],
        console: [
          { text: 'Window A: COMMIT', tone: 'success' },
          { text: 'Window B: ERROR 40001: could not serialize access due to read/write dependencies', tone: 'error' },
        ],
      },
    ],
  },

  {
    id: 13,
    code: '13',
    module: 'm5',
    difficulty: 'Boss',
    tag: '2 Windows · Deadlock Cycle',
    title: 'Deadlock — Two Friends Swapping Account Balances',
    hint: 'A locks Alice and wants Bob; B locks Bob and wants Alice. Prevent deadlocks by always locking rows in the same ID order.',
    expect: 'PostgreSQL automatically detects the circular dependency (SQLSTATE 40P01) and aborts one transaction.',
    filename: '13_deadlock_swap.sql',
    mode: 'dual',
    resetSql: `UPDATE accounts SET balance = 100 WHERE id IN (1, 2);`,
    dualRows: [
      {
        step: 1,
        windowA: `BEGIN;\nUPDATE accounts SET balance = balance + 10 WHERE id = 1; -- locks Alice`,
        windowB: `BEGIN;\nUPDATE accounts SET balance = balance + 10 WHERE id = 2; -- locks Bob`,
      },
      {
        step: 2,
        windowA: `UPDATE accounts SET balance = balance + 10 WHERE id = 2;\n-- WAITS for Window B...`,
        windowB: `-- holds lock on Bob`,
      },
      {
        step: 3,
        windowA: `-- unblocks! COMMIT; (survivor)`,
        windowB: `UPDATE accounts SET balance = balance + 10 WHERE id = 1;\n-- ERROR 40P01: deadlock detected! -> ROLLBACK;`,
      },
    ],
    steps: [
      {
        label: 'Step 1 (Cross row locks)',
        txBadge: 'LOCKED',
        activeDualStep: 1,
        tables: [
          {
            title: 'Current Locks',
            columns: ['account', 'owner', 'locked_by'],
            rows: [
              [{ value: 'id = 1' }, { value: 'Alice' }, { value: 'Window A', tone: 'locked' }],
              [{ value: 'id = 2' }, { value: 'Bob' }, { value: 'Window B', tone: 'locked' }],
            ],
          },
        ],
        console: [{ text: 'Window A holds lock on Alice; Window B holds lock on Bob', tone: 'info' }],
      },
      {
        label: 'Step 2 (Window A waits)',
        txBadge: 'LOCKED',
        activeDualStep: 2,
        tables: [
          {
            title: 'Wait Graph',
            columns: ['session', 'holds', 'waiting_for'],
            rows: [
              [{ value: 'Window A' }, { value: 'Alice (id 1)' }, { value: 'Bob (held by B)', tone: 'changed' }],
              [{ value: 'Window B' }, { value: 'Bob (id 2)' }, { value: '—' }],
            ],
          },
        ],
        console: [{ text: 'Window A paused waiting for Bob lock...', tone: 'warn' }],
      },
      {
        label: 'Step 3 (Deadlock Broken!)',
        txBadge: 'DEADLOCK',
        activeDualStep: 3,
        tables: [
          {
            title: 'PostgreSQL Deadlock Detector',
            badge: 'SQLSTATE 40P01',
            columns: ['session', 'resolution'],
            rows: [
              [{ value: 'Window A (Survivor)' }, { value: 'Unblocked -> COMMIT', tone: 'added' }],
              [{ value: 'Window B (Victim)' }, { value: 'Killed by DB (40P01) -> ROLLBACK', tone: 'error' }],
            ],
          },
        ],
        console: [
          { text: 'ERROR 40P01: deadlock detected (Process A waiting for Process B, Process B waiting for Process A)', tone: 'error' },
          { text: 'Window A: COMMIT', tone: 'success' },
        ],
      },
    ],
  },

  {
    id: 14,
    code: '14',
    module: 'm5',
    difficulty: 'Boss',
    tag: 'Pro Pattern · CTE',
    title: 'Atomic Booking — Selling the Last Concert Ticket',
    hint: 'Conditional UPDATE only claims a seat if seats_left > 0. RETURNING passes the ID directly to INSERT.',
    expect: 'First buyer gets the seat. If a second buyer clicks at the exact same instant, 0 rows are inserted. Zero double-booking!',
    filename: '14_last_concert_ticket.sql',
    mode: 'single',
    sql: `BEGIN;

WITH claimed AS (
  UPDATE shows
  SET seats_left = seats_left - 1
  WHERE id = 1 AND seats_left > 0
  RETURNING id
)
INSERT INTO bookings (show_id, guest)
SELECT id, 'Emma' FROM claimed
RETURNING id, guest;

COMMIT;`,
    steps: [
      {
        label: '1st Buyer (1 seat left)',
        txBadge: 'COMMITTED',
        highlightLines: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13],
        tables: [
          {
            title: 'shows',
            columns: ['id', 'seats_left'],
            rows: [[{ value: '1' }, { value: '0 (was 1)', tone: 'changed' }]],
          },
          {
            title: 'bookings (RETURNING)',
            badge: 'TICKET ISSUED',
            columns: ['booking_id', 'guest'],
            rows: [[{ value: '1', tone: 'added' }, { value: 'Emma', tone: 'added' }]],
          },
        ],
        console: [
          { text: 'claimed CTE -> seat 1 claimed', tone: 'info' },
          { text: 'RETURNING -> booking confirmed for Emma', tone: 'success' },
          { text: 'COMMIT', tone: 'success' },
        ],
      },
      {
        label: '2nd Buyer (0 seats left)',
        txBadge: 'COMMITTED',
        highlightLines: [4, 5, 6, 9, 10],
        tables: [
          {
            title: 'shows',
            columns: ['id', 'seats_left'],
            rows: [[{ value: '1' }, { value: '0' }]],
          },
          {
            title: 'bookings (2nd concurrent attempt)',
            badge: 'SOLD OUT (0 ROWS)',
            columns: ['booking_id', 'guest'],
            rows: [[{ value: '(0 rows)', tone: 'muted' }, { value: 'Sold out cleanly', tone: 'error' }]],
          },
        ],
        console: [
          { text: 'claimed CTE matched 0 rows -> INSERT 0 0', tone: 'warn' },
          { text: 'COMMIT -- safe, no overbooking possible!', tone: 'success' },
        ],
      },
    ],
  },

  {
    id: 15,
    code: '15',
    module: 'm5',
    difficulty: 'Boss',
    tag: 'Pro Pattern · Safe Undo',
    title: 'Cancel Safely — No Imaginary Free Tickets',
    hint: 'Only increment seats_left if DELETE actually found and removed a real booking. Double-clicking cancel creates no fake seats.',
    expect: 'First cancellation restores 1 seat. Re-running the cancel command updates 0 rows, preventing phantom inventory.',
    filename: '15_safe_ticket_cancellation.sql',
    mode: 'single',
    sql: `BEGIN;

WITH removed AS (
  DELETE FROM bookings
  WHERE show_id = 1 AND guest = 'Emma'
  RETURNING show_id
)
UPDATE shows AS s
SET seats_left = seats_left + 1
FROM removed AS r
WHERE s.id = r.show_id
RETURNING s.seats_left;

COMMIT;`,
    steps: [
      {
        label: '1st Cancellation (Valid)',
        txBadge: 'COMMITTED',
        highlightLines: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14],
        tables: [
          {
            title: 'bookings',
            columns: ['booking_id', 'guest'],
            rows: [[{ value: '(deleted)', tone: 'muted' }, { value: 'Emma', tone: 'error' }]],
          },
          {
            title: 'shows (RETURNING seats_left)',
            badge: 'SEAT RESTORED',
            columns: ['seats_left'],
            rows: [[{ value: '1 (0 -> 1)', tone: 'added' }]],
          },
        ],
        console: [
          { text: 'DELETE 1 -> Emma removed', tone: 'info' },
          { text: 'UPDATE 1 -> seats_left restored to 1', tone: 'success' },
          { text: 'COMMIT', tone: 'success' },
        ],
      },
      {
        label: '2nd Click (Already Cancelled)',
        txBadge: 'COMMITTED',
        highlightLines: [4, 5, 8, 9],
        tables: [
          {
            title: 'shows',
            badge: 'NO PHANTOM SEATS',
            columns: ['seats_left'],
            rows: [[{ value: '1 (unchanged)', tone: 'added' }]],
          },
        ],
        console: [
          { text: 'removed CTE matched 0 rows -> UPDATE 0', tone: 'warn' },
          { text: 'COMMIT -- capacity stays strictly at 1', tone: 'success' },
        ],
      },
    ],
  },
];

export interface IsolationRow {
  level: string;
  isDefault?: boolean;
  pgNote: string;
  pg: {
    dirtyRead: boolean;
    phantomRead: boolean;
    lostUpdate: boolean;
  };
  sqlStandard: {
    dirtyRead: boolean;
    phantomRead: boolean;
    lostUpdate: boolean;
  };
}

export const ISOLATION_LEVELS: IsolationRow[] = [
  {
    level: 'READ UNCOMMITTED',
    pgNote: 'Acts as Read Committed in PG',
    pg: { dirtyRead: true, phantomRead: false, lostUpdate: false },
    sqlStandard: { dirtyRead: false, phantomRead: false, lostUpdate: false },
  },
  {
    level: 'READ COMMITTED',
    isDefault: true,
    pgNote: 'PostgreSQL Default',
    pg: { dirtyRead: true, phantomRead: false, lostUpdate: false },
    sqlStandard: { dirtyRead: true, phantomRead: false, lostUpdate: false },
  },
  {
    level: 'REPEATABLE READ',
    pgNote: 'MVCC Snapshot Isolation',
    pg: { dirtyRead: true, phantomRead: true, lostUpdate: true },
    sqlStandard: { dirtyRead: true, phantomRead: false, lostUpdate: false },
  },
  {
    level: 'SERIALIZABLE',
    pgNote: 'Serializable Snapshot (SSI)',
    pg: { dirtyRead: true, phantomRead: true, lostUpdate: true },
    sqlStandard: { dirtyRead: true, phantomRead: true, lostUpdate: true },
  },
];
