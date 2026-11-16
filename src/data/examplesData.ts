export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Boss';

export type ModuleId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

export interface ModuleInfo {
  id: ModuleId;
  num: string;
  title: string;
  subtitle: string;
}

export const MODULES: ModuleInfo[] = [
  { id: 'm1', num: 'M1', title: 'Basics', subtitle: 'COMMIT, ROLLBACK, Traps & Checks' },
  { id: 'm2', num: 'M2', title: 'Savepoints', subtitle: 'Checkpoints & Error Repair' },
  { id: 'm3', num: 'M3', title: 'Isolation', subtitle: 'Snapshots & Concurrent Reads' },
  { id: 'm4', num: 'M4', title: 'Locks', subtitle: 'Lost Updates & FOR UPDATE' },
  { id: 'm5', num: 'M5', title: 'Boss Lab', subtitle: 'Write Skew, Deadlocks & CTEs' },
];

export interface AcidCardData {
  letter: string;
  title: string;
  tagline: string;
  accent: 'cyan' | 'emerald' | 'violet' | 'amber';
}

export const ACID_CARDS: AcidCardData[] = [
  { letter: 'A', title: 'Atomicity', tagline: 'All succeed, or all fail.', accent: 'cyan' },
  { letter: 'C', title: 'Consistency', tagline: 'Constraints never break.', accent: 'emerald' },
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
  code: string; // e.g. '01'
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

CREATE TABLE players (
  id INT PRIMARY KEY, nickname TEXT,
  coins INT NOT NULL CHECK (coins >= 0));
INSERT INTO players VALUES (1, 's1mple', 5200);

CREATE TABLE inventory (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  player TEXT, item TEXT);
INSERT INTO inventory (player, item) VALUES ('s1mple', 'Knife');

CREATE TABLE wallets (
  id INT PRIMARY KEY, owner TEXT,
  coins INT NOT NULL CHECK (coins >= 0));
INSERT INTO wallets VALUES
  (1, 'Luna', 100), (2, 'Robot', 100), (3, 'Dragon', 50);

CREATE TABLE suits_stock (
  model TEXT PRIMARY KEY, stock INT CHECK (stock >= 0));
INSERT INTO suits_stock VALUES ('Mark LXXXV', 10);

CREATE TABLE orders (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer TEXT, item TEXT, qty INT);

CREATE TABLE tavern_inventory (
  room TEXT PRIMARY KEY, chairs INT, tables INT);
INSERT INTO tavern_inventory VALUES ('Main Hall', 12, 4);

CREATE TABLE agents (
  name TEXT PRIMARY KEY, status TEXT, owner TEXT);
INSERT INTO agents VALUES ('Jett', 'OPEN', NULL);

CREATE TABLE guards (id INT PRIMARY KEY, on_duty BOOLEAN);
INSERT INTO guards VALUES (1, TRUE), (2, TRUE);

CREATE TABLE shows (id INT PRIMARY KEY, seats_left INT CHECK (seats_left >= 0));
INSERT INTO shows VALUES (1, 1);

CREATE TABLE bookings (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  show_id INT REFERENCES shows(id), guest TEXT);`;

export const EXAMPLES: LessonExample[] = [
  // ===================== MODULE 01: BASICS (4 EXAMPLES) =====================
  {
    id: 1,
    code: '01',
    module: 'm1',
    difficulty: 'Easy',
    tag: 'CS2 Economy',
    title: 'BEGIN + COMMIT — s1mple Buys an AWP',
    hint: 'BEGIN groups statements into one unit. COMMIT saves all changes together.',
    expect: 's1mple = 450 coins and owns the AWP. Both changes succeed permanently.',
    filename: '01_cs2_buy_awp.sql',
    mode: 'single',
    sql: `BEGIN;

UPDATE players
SET coins = coins - 4750
WHERE nickname = 's1mple';

INSERT INTO inventory (player, item)
VALUES ('s1mple', 'AWP');

COMMIT;
SELECT nickname, coins FROM players;`,
    steps: [
      {
        label: 'BEGIN',
        txBadge: 'IN TX',
        highlightLines: [1],
        tables: [
          {
            title: 'players',
            columns: ['nickname', 'coins'],
            rows: [[{ value: 's1mple' }, { value: '5200' }]],
          },
          {
            title: 'inventory',
            columns: ['player', 'item'],
            rows: [[{ value: 's1mple' }, { value: 'Knife' }]],
          },
        ],
        console: [{ text: 'BEGIN', tone: 'info' }],
      },
      {
        label: '-$4750',
        txBadge: 'IN TX',
        highlightLines: [3, 4, 5],
        tables: [
          {
            title: 'players',
            badge: 'UNCOMMITTED',
            columns: ['nickname', 'coins'],
            rows: [[{ value: 's1mple' }, { value: '450 (-4750)', tone: 'changed' }]],
          },
          {
            title: 'inventory',
            columns: ['player', 'item'],
            rows: [[{ value: 's1mple' }, { value: 'Knife' }]],
          },
        ],
        console: [{ text: 'UPDATE 1  -- only visible inside this session', tone: 'warn' }],
      },
      {
        label: '+AWP',
        txBadge: 'IN TX',
        highlightLines: [7, 8],
        tables: [
          {
            title: 'players',
            badge: 'UNCOMMITTED',
            columns: ['nickname', 'coins'],
            rows: [[{ value: 's1mple' }, { value: '450', tone: 'changed' }]],
          },
          {
            title: 'inventory',
            badge: 'UNCOMMITTED',
            columns: ['player', 'item'],
            rows: [
              [{ value: 's1mple' }, { value: 'Knife' }],
              [{ value: 's1mple', tone: 'added' }, { value: 'AWP', tone: 'added' }],
            ],
          },
        ],
        console: [{ text: 'INSERT 0 1  -- AWP staged in transaction', tone: 'warn' }],
      },
      {
        label: 'COMMIT',
        txBadge: 'COMMITTED',
        highlightLines: [10, 11],
        tables: [
          {
            title: 'SELECT nickname, coins FROM players',
            badge: 'SAVED',
            columns: ['nickname', 'coins'],
            rows: [[{ value: 's1mple' }, { value: '450', tone: 'changed' }]],
          },
          {
            title: 'inventory',
            badge: 'SAVED',
            columns: ['player', 'item'],
            rows: [
              [{ value: 's1mple' }, { value: 'Knife' }],
              [{ value: 's1mple', tone: 'added' }, { value: 'AWP', tone: 'added' }],
            ],
          },
        ],
        console: [
          { text: 'COMMIT', tone: 'success' },
          { text: 'nickname: s1mple | coins: 450 (1 row)', tone: 'info' },
        ],
      },
    ],
  },

  {
    id: 2,
    code: '02',
    module: 'm1',
    difficulty: 'Easy',
    tag: 'Undo Changes',
    title: 'ROLLBACK — Luna Changes Her Mind',
    hint: 'ROLLBACK cancels all uncommitted changes made since BEGIN.',
    expect: 'Luna temporarily sees 80 coins mid-transaction, then goes right back to 100.',
    filename: '02_luna_rollback.sql',
    mode: 'single',
    sql: `BEGIN;

UPDATE wallets SET coins = coins - 20 WHERE id = 1;
SELECT owner, coins FROM wallets WHERE id = 1; -- 80

ROLLBACK;

SELECT owner, coins FROM wallets WHERE id = 1; -- 100`,
    steps: [
      {
        label: 'UPDATE -20',
        txBadge: 'IN TX',
        highlightLines: [1, 3, 4],
        tables: [
          {
            title: 'wallets (inside TX)',
            badge: 'TEMPORARY',
            columns: ['id', 'owner', 'coins'],
            rows: [[{ value: '1' }, { value: 'Luna' }, { value: '80 (-20)', tone: 'changed' }]],
          },
        ],
        console: [
          { text: 'BEGIN', tone: 'info' },
          { text: 'UPDATE 1', tone: 'warn' },
          { text: 'SELECT -> Luna | 80', tone: 'info' },
        ],
      },
      {
        label: 'ROLLBACK',
        txBadge: 'ROLLED BACK',
        highlightLines: [6, 8],
        tables: [
          {
            title: 'SELECT owner, coins FROM wallets WHERE id = 1',
            badge: 'REVERTED',
            columns: ['id', 'owner', 'coins'],
            rows: [[{ value: '1' }, { value: 'Luna' }, { value: '100', tone: 'normal' }]],
          },
        ],
        console: [
          { text: 'ROLLBACK', tone: 'error' },
          { text: 'SELECT -> Luna | 100 (1 row)', tone: 'success' },
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
    title: 'UPDATE 0 — Paying a Nonexistent Alien',
    hint: 'Matching 0 rows is NOT an SQL error. Your application must check row counts.',
    expect: 'No coins lost thanks to ROLLBACK. With COMMIT, 10 coins would vanish into space!',
    filename: '03_update_zero_alien.sql',
    mode: 'single',
    sql: `BEGIN;

UPDATE wallets SET coins = coins - 10 WHERE id = 1;
-- UPDATE 1 (Luna loses 10)

UPDATE wallets SET coins = coins + 10 WHERE id = 99;
-- UPDATE 0 (Alien id 99 does not exist!)

ROLLBACK;`,
    steps: [
      {
        label: 'Luna -10',
        txBadge: 'IN TX',
        highlightLines: [1, 3, 4],
        tables: [
          {
            title: 'wallets',
            columns: ['id', 'owner', 'coins'],
            rows: [
              [{ value: '1' }, { value: 'Luna' }, { value: '90 (-10)', tone: 'changed' }],
              [{ value: '2' }, { value: 'Robot' }, { value: '100' }],
            ],
          },
        ],
        console: [{ text: 'UPDATE 1  -- 1 row matched', tone: 'warn' }],
      },
      {
        label: 'Alien +10 (0 rows!)',
        txBadge: 'IN TX',
        highlightLines: [6, 7],
        tables: [
          {
            title: 'wallets',
            badge: 'MONEY MISSING!',
            columns: ['id', 'owner', 'coins'],
            rows: [
              [{ value: '1' }, { value: 'Luna' }, { value: '90', tone: 'error' }],
              [{ value: '99', tone: 'muted' }, { value: '(not found)', tone: 'error' }, { value: '0 rows', tone: 'error' }],
            ],
          },
        ],
        console: [
          { text: 'UPDATE 0  -- NO SQL ERROR! 0 rows updated.', tone: 'error' },
        ],
      },
      {
        label: 'ROLLBACK',
        txBadge: 'ROLLED BACK',
        highlightLines: [9],
        tables: [
          {
            title: 'wallets',
            badge: 'SAFE',
            columns: ['id', 'owner', 'coins'],
            rows: [
              [{ value: '1' }, { value: 'Luna' }, { value: '100', tone: 'added' }],
              [{ value: '2' }, { value: 'Robot' }, { value: '100' }],
            ],
          },
        ],
        console: [
          { text: 'ROLLBACK -- App caught UPDATE 0 and cancelled!', tone: 'success' },
        ],
      },
    ],
  },

  {
    id: 4,
    code: '04',
    module: 'm1',
    difficulty: 'Easy',
    tag: 'Marvel · Constraints',
    title: 'Atomicity + CHECK — Tony Stark Orders 50 Suits',
    hint: 'CHECK (stock >= 0) forbids negative inventory. One failed query aborts the whole block.',
    expect: 'Error aborts the transaction. Stock remains 10 and the partial order is erased too.',
    filename: '04_stark_suits_check.sql',
    mode: 'single',
    sql: `-- Rule: stock INT CHECK (stock >= 0)  [Current stock: 10]
BEGIN;

INSERT INTO orders (customer, item, qty)
VALUES ('Tony Stark', 'Mark LXXXV', 50);

UPDATE suits_stock
SET stock = stock - 50
WHERE model = 'Mark LXXXV';
-- ERROR: violates check constraint "stock >= 0"

COMMIT; -- Auto-aborted -> executes ROLLBACK!`,
    steps: [
      {
        label: 'INSERT Order',
        txBadge: 'IN TX',
        highlightLines: [2, 4, 5],
        tables: [
          {
            title: 'orders',
            badge: 'STAGED',
            columns: ['customer', 'item', 'qty'],
            rows: [[{ value: 'Tony Stark', tone: 'added' }, { value: 'Mark LXXXV' }, { value: '50' }]],
          },
          {
            title: 'suits_stock',
            columns: ['model', 'stock'],
            rows: [[{ value: 'Mark LXXXV' }, { value: '10' }]],
          },
        ],
        console: [{ text: 'INSERT 0 1', tone: 'warn' }],
      },
      {
        label: 'CHECK Error',
        txBadge: 'ABORTED',
        highlightLines: [7, 8, 9, 10],
        tables: [
          {
            title: 'orders',
            badge: 'ABORTED',
            columns: ['customer', 'item', 'qty'],
            rows: [[{ value: 'Tony Stark', tone: 'error' }, { value: 'Mark LXXXV', tone: 'error' }, { value: '50 (pending undo)', tone: 'error' }]],
          },
          {
            title: 'suits_stock',
            badge: 'BLOCKED',
            columns: ['model', 'stock'],
            rows: [[{ value: 'Mark LXXXV' }, { value: '10 (10 - 50 = -40!)', tone: 'error' }]],
          },
        ],
        console: [
          { text: 'ERROR: new row violates check constraint "suits_stock_stock_check"', tone: 'error' },
          { text: 'DETAIL: Failing row contains (Mark LXXXV, -40).', tone: 'error' },
        ],
      },
      {
        label: 'Auto ROLLBACK',
        txBadge: 'ROLLED BACK',
        highlightLines: [12],
        tables: [
          {
            title: 'orders',
            badge: 'WIPED (ATOMIC)',
            columns: ['customer', 'item', 'qty'],
            rows: [[{ value: '(0 rows)', tone: 'muted' }, { value: '—', tone: 'muted' }, { value: '—', tone: 'muted' }]],
          },
          {
            title: 'suits_stock',
            badge: 'INTACT',
            columns: ['model', 'stock'],
            rows: [[{ value: 'Mark LXXXV' }, { value: '10', tone: 'added' }]],
          },
        ],
        console: [
          { text: 'WARNING: current transaction is aborted', tone: 'warn' },
          { text: 'ROLLBACK', tone: 'error' },
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
    tag: 'Fantasy RPG Tavern',
    title: 'SAVEPOINT — Keep the Beers, Undo the Brawl',
    hint: 'SAVEPOINT sets a checkpoint inside a transaction so you can roll back only the mistake.',
    expect: 'Tavern chairs & tables return to normal, while the 3 beers stay committed.',
    filename: '05_tavern_savepoint.sql',
    mode: 'single',
    sql: `BEGIN;

INSERT INTO orders (customer, item, qty)
VALUES ('Heroes', 'Buy 3 beers', 3);

SAVEPOINT pre_brawl;

UPDATE tavern_inventory
SET chairs = 0, tables = 0
WHERE room = 'Main Hall'; -- Throw tables & break chairs!

ROLLBACK TO SAVEPOINT pre_brawl; -- Undo damage

COMMIT; -- Party still gets the 3 beers`,
    steps: [
      {
        label: 'Buy 3 Beers',
        txBadge: 'IN TX',
        highlightLines: [1, 3, 4],
        tables: [
          {
            title: 'orders',
            columns: ['customer', 'item', 'qty'],
            rows: [[{ value: 'Heroes', tone: 'added' }, { value: 'Buy 3 beers', tone: 'added' }, { value: '3' }]],
          },
          {
            title: 'tavern_inventory',
            columns: ['room', 'chairs', 'tables'],
            rows: [[{ value: 'Main Hall' }, { value: '12' }, { value: '4' }]],
          },
        ],
        console: [{ text: 'INSERT 0 1 -- 3 beers added', tone: 'info' }],
      },
      {
        label: 'SAVEPOINT + Brawl',
        txBadge: 'SAVEPOINT',
        highlightLines: [6, 8, 9, 10],
        tables: [
          {
            title: 'orders',
            columns: ['customer', 'item', 'qty'],
            rows: [[{ value: 'Heroes' }, { value: 'Buy 3 beers' }, { value: '3' }]],
          },
          {
            title: 'tavern_inventory',
            badge: 'WRECKED!',
            columns: ['room', 'chairs', 'tables'],
            rows: [[{ value: 'Main Hall' }, { value: '0', tone: 'error' }, { value: '0', tone: 'error' }]],
          },
        ],
        console: [
          { text: 'SAVEPOINT pre_brawl', tone: 'info' },
          { text: 'UPDATE 1 -- chairs=0, tables=0', tone: 'error' },
        ],
      },
      {
        label: 'ROLLBACK TO + COMMIT',
        txBadge: 'COMMITTED',
        highlightLines: [12, 14],
        tables: [
          {
            title: 'orders',
            badge: 'SAVED',
            columns: ['customer', 'item', 'qty'],
            rows: [[{ value: 'Heroes', tone: 'added' }, { value: 'Buy 3 beers', tone: 'added' }, { value: '3' }]],
          },
          {
            title: 'tavern_inventory',
            badge: 'RESTORED',
            columns: ['room', 'chairs', 'tables'],
            rows: [[{ value: 'Main Hall' }, { value: '12', tone: 'added' }, { value: '4', tone: 'added' }]],
          },
        ],
        console: [
          { text: 'ROLLBACK -- reverted to pre_brawl', tone: 'warn' },
          { text: 'COMMIT -- beers served, tavern intact!', tone: 'success' },
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
    title: 'SAVEPOINT Repair — The Evil Luna Clone',
    hint: 'A failed statement aborts the transaction. ROLLBACK TO SAVEPOINT repairs it without losing earlier work.',
    expect: 'No clone exists; Robot still receives +5 coins and the transaction commits cleanly.',
    filename: '06_evil_luna_clone.sql',
    mode: 'single',
    sql: `BEGIN;

SAVEPOINT before_clone;

INSERT INTO wallets VALUES (1, 'Evil Luna', 999);
-- ERROR: duplicate key value violates primary key (id=1)

ROLLBACK TO SAVEPOINT before_clone; -- Repairs ABORTED state!

UPDATE wallets SET coins = coins + 5 WHERE id = 2;
RELEASE SAVEPOINT before_clone;

COMMIT;`,
    steps: [
      {
        label: 'Duplicate PK Error',
        txBadge: 'ABORTED',
        highlightLines: [1, 3, 5, 6],
        tables: [
          {
            title: 'wallets',
            badge: 'TX ABORTED',
            columns: ['id', 'owner', 'coins'],
            rows: [
              [{ value: '1' }, { value: 'Luna' }, { value: '100' }],
              [{ value: '2' }, { value: 'Robot' }, { value: '100' }],
            ],
          },
        ],
        console: [
          { text: 'SAVEPOINT before_clone', tone: 'info' },
          { text: 'ERROR: duplicate key value violates unique constraint "wallets_pkey"', tone: 'error' },
        ],
      },
      {
        label: 'Repair + Robot +5',
        txBadge: 'COMMITTED',
        highlightLines: [8, 10, 11, 13],
        tables: [
          {
            title: 'wallets',
            badge: 'COMMITTED',
            columns: ['id', 'owner', 'coins'],
            rows: [
              [{ value: '1' }, { value: 'Luna (safe)' }, { value: '100' }],
              [{ value: '2' }, { value: 'Robot' }, { value: '105 (+5)', tone: 'added' }],
            ],
          },
        ],
        console: [
          { text: 'ROLLBACK -- TX repaired back to before_clone!', tone: 'warn' },
          { text: 'UPDATE 1 -- Robot +5', tone: 'info' },
          { text: 'COMMIT', tone: 'success' },
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
    tag: 'Isolation Config',
    title: 'Set & Check Isolation Level',
    hint: 'Choose the isolation level before your first data query. PostgreSQL defaults to READ COMMITTED.',
    expect: 'SHOW reflects the chosen level inside the block, then returns to session default after COMMIT.',
    filename: '07_set_isolation.sql',
    mode: 'single',
    sql: `SHOW transaction_isolation; -- read committed

BEGIN;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SHOW transaction_isolation; -- repeatable read
COMMIT;

SHOW transaction_isolation; -- back to read committed
-- Shorthand: BEGIN ISOLATION LEVEL SERIALIZABLE;`,
    steps: [
      {
        label: 'Inside TX',
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
          { text: 'SET', tone: 'info' },
          { text: 'transaction_isolation: repeatable read', tone: 'success' },
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
            rows: [[{ value: 'read committed (default)', tone: 'normal' }]],
          },
        ],
        console: [
          { text: 'COMMIT', tone: 'success' },
          { text: 'transaction_isolation: read committed', tone: 'info' },
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
    title: 'READ COMMITTED — Balance Changes Mid-Story',
    hint: 'A fresh snapshot is taken for each SELECT. Another committed transaction can change what you see.',
    expect: 'Window A reads 100, then 200. Same row, different values inside one transaction!',
    filename: '08_read_committed.sql',
    mode: 'dual',
    resetSql: `UPDATE wallets SET coins = 100 WHERE id = 1;`,
    dualRows: [
      {
        step: 1,
        windowA: `BEGIN ISOLATION LEVEL READ COMMITTED;\nSELECT coins FROM wallets WHERE id = 1; -- 100`,
        windowB: `-- idle`,
      },
      {
        step: 2,
        windowA: `-- still inside TX...`,
        windowB: `UPDATE wallets SET coins = 200 WHERE id = 1;\n-- autocommitted!`,
      },
      {
        step: 3,
        windowA: `SELECT coins FROM wallets WHERE id = 1; -- 200\nCOMMIT;`,
        windowB: `-- done`,
      },
    ],
    steps: [
      {
        label: 'Step 1 (A reads)',
        txBadge: 'IN TX',
        activeDualStep: 1,
        tables: [
          {
            title: 'Window A sees',
            columns: ['owner', 'coins'],
            rows: [[{ value: 'Luna' }, { value: '100' }]],
          },
        ],
        console: [{ text: 'Window A: SELECT -> 100', tone: 'info' }],
      },
      {
        label: 'Step 2 (B writes)',
        txBadge: 'IN TX',
        activeDualStep: 2,
        tables: [
          {
            title: 'Database (committed by B)',
            columns: ['owner', 'coins'],
            rows: [[{ value: 'Luna' }, { value: '200 (updated by B)', tone: 'changed' }]],
          },
        ],
        console: [{ text: 'Window B: UPDATE 1 (autocommitted -> 200)', tone: 'warn' }],
      },
      {
        label: 'Step 3 (A re-reads)',
        txBadge: 'COMMITTED',
        activeDualStep: 3,
        tables: [
          {
            title: 'Window A Reads Comparison',
            badge: 'CHANGED MID-TX',
            columns: ['read_#', 'coins'],
            rows: [
              [{ value: '1st SELECT' }, { value: '100' }],
              [{ value: '2nd SELECT' }, { value: '200', tone: 'error' }],
            ],
          },
        ],
        console: [
          { text: 'Window A: SELECT -> 200 (Non-repeatable read!)', tone: 'error' },
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
    title: 'REPEATABLE READ — Frozen Snapshot',
    hint: 'The transaction sees a single frozen snapshot from its first query. PostgreSQL also blocks phantom reads here.',
    expect: 'Window A reads 100 twice. The DB actually holds 200 after B commits, but A stays consistent.',
    filename: '09_repeatable_read.sql',
    mode: 'dual',
    resetSql: `UPDATE wallets SET coins = 100 WHERE id = 1;`,
    dualRows: [
      {
        step: 1,
        windowA: `BEGIN ISOLATION LEVEL REPEATABLE READ;\nSELECT coins FROM wallets WHERE id = 1; -- 100`,
        windowB: `-- idle`,
      },
      {
        step: 2,
        windowA: `-- snapshot frozen at Step 1`,
        windowB: `UPDATE wallets SET coins = 200 WHERE id = 1;\n-- autocommitted!`,
      },
      {
        step: 3,
        windowA: `SELECT coins FROM wallets WHERE id = 1; -- 100\nCOMMIT;`,
        windowB: `-- done`,
      },
    ],
    steps: [
      {
        label: 'Step 1 (Snapshot)',
        txBadge: 'IN TX',
        activeDualStep: 1,
        tables: [
          {
            title: 'Window A Snapshot',
            columns: ['owner', 'coins'],
            rows: [[{ value: 'Luna' }, { value: '100' }]],
          },
        ],
        console: [{ text: 'Window A: Snapshot taken -> coins = 100', tone: 'info' }],
      },
      {
        label: 'Step 2 (B writes)',
        txBadge: 'IN TX',
        activeDualStep: 2,
        tables: [
          {
            title: 'DB Latest vs Window A Snapshot',
            columns: ['view', 'coins'],
            rows: [
              [{ value: 'DB Actual (B committed)' }, { value: '200', tone: 'changed' }],
              [{ value: 'Window A Snapshot' }, { value: '100 (frozen)', tone: 'added' }],
            ],
          },
        ],
        console: [{ text: 'Window B: UPDATE 1 (coins = 200)', tone: 'warn' }],
      },
      {
        label: 'Step 3 (A re-reads)',
        txBadge: 'COMMITTED',
        activeDualStep: 3,
        tables: [
          {
            title: 'Window A Reads Comparison',
            badge: 'CONSISTENT',
            columns: ['read_#', 'coins'],
            rows: [
              [{ value: '1st SELECT' }, { value: '100', tone: 'added' }],
              [{ value: '2nd SELECT' }, { value: '100', tone: 'added' }],
            ],
          },
        ],
        console: [
          { text: 'Window A: SELECT -> 100 (Same snapshot!)', tone: 'success' },
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
    tag: '2 Windows · Race Bug',
    title: 'Lost Update — Two People Use Stale Math',
    hint: 'Each session reads 100 and calculates locally. The second write silently overwrites the first subtraction.',
    expect: 'Final balance = 80, but the true math is 50 (100 - 30 - 20). 30 coins disappeared!',
    filename: '10_lost_update_bug.sql',
    mode: 'dual',
    resetSql: `UPDATE wallets SET coins = 100 WHERE id = 1;`,
    dualRows: [
      {
        step: 1,
        windowA: `BEGIN;\nSELECT coins FROM wallets WHERE id = 1; -- 100`,
        windowB: `BEGIN;\nSELECT coins FROM wallets WHERE id = 1; -- 100`,
      },
      {
        step: 2,
        windowA: `-- App computes: 100 - 30 = 70\nUPDATE wallets SET coins = 70 WHERE id = 1;\nCOMMIT;`,
        windowB: `-- still holding stale 100...`,
      },
      {
        step: 3,
        windowA: `-- done`,
        windowB: `-- App computes: 100 - 20 = 80\nUPDATE wallets SET coins = 80 WHERE id = 1;\nCOMMIT;`,
      },
    ],
    steps: [
      {
        label: 'Step 1 (Both read 100)',
        txBadge: 'IN TX',
        activeDualStep: 1,
        tables: [
          {
            title: 'Both sessions hold stale value',
            columns: ['session', 'read_coins', 'wants_to_subtract'],
            rows: [
              [{ value: 'Window A' }, { value: '100' }, { value: '-30' }],
              [{ value: 'Window B' }, { value: '100' }, { value: '-20' }],
            ],
          },
        ],
        console: [
          { text: 'Window A: coins = 100', tone: 'info' },
          { text: 'Window B: coins = 100', tone: 'info' },
        ],
      },
      {
        label: 'Step 2 (A sets 70)',
        txBadge: 'IN TX',
        activeDualStep: 2,
        tables: [
          {
            title: 'wallets',
            columns: ['id', 'owner', 'coins'],
            rows: [[{ value: '1' }, { value: 'Luna' }, { value: '70', tone: 'changed' }]],
          },
        ],
        console: [{ text: 'Window A: UPDATE coins = 70; COMMIT;', tone: 'warn' }],
      },
      {
        label: 'Step 3 (B overwrites 80!)',
        txBadge: 'COMMITTED',
        activeDualStep: 3,
        tables: [
          {
            title: 'wallets (BUG!)',
            badge: 'LOST UPDATE',
            columns: ['id', 'owner', 'actual_coins', 'expected'],
            rows: [
              [
                { value: '1' },
                { value: 'Luna' },
                { value: '80', tone: 'error' },
                { value: '50 (100 - 30 - 20)', tone: 'added' },
              ],
            ],
          },
        ],
        console: [
          { text: 'Window B: UPDATE coins = 80; COMMIT; -- -30 wiped out!', tone: 'error' },
        ],
      },
    ],
  },

  {
    id: 11,
    code: '11',
    module: 'm4',
    difficulty: 'Hard',
    tag: 'Valorant · Row Lock',
    title: 'FOR UPDATE — Two Players Insta-Locking Jett',
    hint: 'SELECT ... FOR UPDATE locks the selected row. Player 2 must wait in queue until Player 1 commits.',
    expect: 'Player 1 locks Jett first. Player 2 unblocks after COMMIT and sees Jett is already taken!',
    filename: '11_valorant_for_update.sql',
    mode: 'dual',
    resetSql: `UPDATE agents SET status = 'OPEN', owner = NULL WHERE name = 'Jett';`,
    dualRows: [
      {
        step: 1,
        windowA: `BEGIN;\nSELECT status FROM agents\nWHERE name = 'Jett' FOR UPDATE; -- 'OPEN'`,
        windowB: `-- idle`,
      },
      {
        step: 2,
        windowA: `-- holds exclusive row lock on 'Jett'`,
        windowB: `BEGIN;\nSELECT status FROM agents\nWHERE name = 'Jett' FOR UPDATE;\n-- WAITING FOR PLAYER 1...`,
      },
      {
        step: 3,
        windowA: `UPDATE agents SET owner = 'Player1', status = 'LOCKED'\nWHERE name = 'Jett';\nCOMMIT;`,
        windowB: `-- UNBLOCKS: sees status = 'LOCKED'!\nROLLBACK;`,
      },
    ],
    steps: [
      {
        label: 'Step 1 (P1 locks Jett)',
        txBadge: 'LOCKED',
        activeDualStep: 1,
        tables: [
          {
            title: 'agents',
            badge: 'ROW LOCKED BY P1',
            columns: ['name', 'status', 'owner'],
            rows: [[{ value: 'Jett', tone: 'locked' }, { value: 'OPEN' }, { value: 'NULL' }]],
          },
        ],
        console: [{ text: "Player 1: Acquired FOR UPDATE lock on 'Jett'", tone: 'success' }],
      },
      {
        label: 'Step 2 (P2 blocked)',
        txBadge: 'LOCKED',
        activeDualStep: 2,
        tables: [
          {
            title: 'agents + Lock Queue',
            badge: 'P2 WAITING',
            columns: ['name', 'status', 'lock_holder', 'waiting'],
            rows: [
              [
                { value: 'Jett', tone: 'locked' },
                { value: 'OPEN' },
                { value: 'Player 1', tone: 'added' },
                { value: 'Player 2 (blocked)', tone: 'changed' },
              ],
            ],
          },
        ],
        console: [
          { text: 'Player 2: Query paused — waiting on row lock...', tone: 'warn' },
        ],
      },
      {
        label: 'Step 3 (P1 commits, P2 sees LOCKED)',
        txBadge: 'COMMITTED',
        activeDualStep: 3,
        tables: [
          {
            title: 'agents',
            badge: 'SAFE',
            columns: ['name', 'status', 'owner'],
            rows: [
              [
                { value: 'Jett' },
                { value: 'LOCKED', tone: 'added' },
                { value: 'Player1', tone: 'added' },
              ],
            ],
          },
        ],
        console: [
          { text: 'Player 1: COMMIT -- Jett locked by Player1', tone: 'success' },
          { text: "Player 2: Unblocked -> sees status = 'LOCKED' (cannot steal!)", tone: 'info' },
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
    title: 'SERIALIZABLE — Someone Must Guard the Castle',
    hint: 'Both guards cannot clock out! SERIALIZABLE detects the conflicting rule across two different rows and aborts one TX.',
    expect: 'One transaction fails with SQLSTATE 40001 and must retry. At least one guard stays on duty.',
    filename: '12_serializable_guards.sql',
    mode: 'dual',
    resetSql: `UPDATE guards SET on_duty = TRUE;`,
    dualRows: [
      {
        step: 1,
        windowA: `BEGIN ISOLATION LEVEL SERIALIZABLE;\nSELECT count(*) FROM guards WHERE on_duty; -- 2`,
        windowB: `BEGIN ISOLATION LEVEL SERIALIZABLE;\nSELECT count(*) FROM guards WHERE on_duty; -- 2`,
      },
      {
        step: 2,
        windowA: `UPDATE guards SET on_duty = FALSE WHERE id = 1;`,
        windowB: `UPDATE guards SET on_duty = FALSE WHERE id = 2;`,
      },
      {
        step: 3,
        windowA: `COMMIT; -- succeeds!`,
        windowB: `COMMIT; -- ERROR 40001: serialization failure!`,
      },
    ],
    steps: [
      {
        label: 'Step 1 (Both count 2)',
        txBadge: 'IN TX',
        activeDualStep: 1,
        tables: [
          {
            title: 'guards',
            columns: ['id', 'on_duty'],
            rows: [
              [{ value: '1' }, { value: 'TRUE', tone: 'added' }],
              [{ value: '2' }, { value: 'TRUE', tone: 'added' }],
            ],
          },
        ],
        console: [{ text: 'Both A & B see count(*) = 2 guards on duty', tone: 'info' }],
      },
      {
        label: 'Step 2 (Different rows!)',
        txBadge: 'IN TX',
        activeDualStep: 2,
        tables: [
          {
            title: 'Uncommitted intent',
            columns: ['id', 'window_a', 'window_b'],
            rows: [
              [{ value: '1' }, { value: 'FALSE', tone: 'changed' }, { value: 'TRUE' }],
              [{ value: '2' }, { value: 'TRUE' }, { value: 'FALSE', tone: 'changed' }],
            ],
          },
        ],
        console: [{ text: 'No row lock conflict — they edit different rows!', tone: 'warn' }],
      },
      {
        label: 'Step 3 (40001 caught!)',
        txBadge: 'SERIALIZATION ERR',
        activeDualStep: 3,
        tables: [
          {
            title: 'guards (Castle Protected!)',
            badge: 'WRITE SKEW PREVENTED',
            columns: ['id', 'on_duty'],
            rows: [
              [{ value: '1' }, { value: 'FALSE' }],
              [{ value: '2' }, { value: 'TRUE (B rolled back!)', tone: 'added' }],
            ],
          },
        ],
        console: [
          { text: 'Window A: COMMIT', tone: 'success' },
          { text: 'Window B: ERROR 40001 could not serialize access due to read/write dependencies', tone: 'error' },
        ],
      },
    ],
  },

  {
    id: 13,
    code: '13',
    module: 'm5',
    difficulty: 'Boss',
    tag: '2 Windows · Lock Cycle',
    title: 'Deadlock — Two Robots Block Each Other',
    hint: 'A locks row 1 and wants row 2; B locks row 2 and wants row 1. Prevent it by always locking rows in the same ID order.',
    expect: 'PostgreSQL detects the cycle (SQLSTATE 40P01) and kills one victim so the other commits.',
    filename: '13_deadlock_robots.sql',
    mode: 'dual',
    resetSql: `UPDATE wallets SET coins = 100 WHERE id IN (1, 2);`,
    dualRows: [
      {
        step: 1,
        windowA: `BEGIN;\nUPDATE wallets SET coins = coins + 1 WHERE id = 1;`,
        windowB: `BEGIN;\nUPDATE wallets SET coins = coins + 1 WHERE id = 2;`,
      },
      {
        step: 2,
        windowA: `UPDATE wallets SET coins = coins + 1 WHERE id = 2;\n-- waits for Window B...`,
        windowB: `-- holds lock on id = 2`,
      },
      {
        step: 3,
        windowA: `-- wakes up! COMMIT; (survivor)`,
        windowB: `UPDATE wallets SET coins = coins + 1 WHERE id = 1;\n-- ERROR 40P01: deadlock detected! -> ROLLBACK;`,
      },
    ],
    steps: [
      {
        label: 'Step 1 (Cross-locks)',
        txBadge: 'LOCKED',
        activeDualStep: 1,
        tables: [
          {
            title: 'Locks Held',
            columns: ['row', 'owner', 'locked_by'],
            rows: [
              [{ value: 'id = 1' }, { value: 'Luna' }, { value: 'Window A', tone: 'locked' }],
              [{ value: 'id = 2' }, { value: 'Robot' }, { value: 'Window B', tone: 'locked' }],
            ],
          },
        ],
        console: [{ text: 'A owns row 1; B owns row 2', tone: 'info' }],
      },
      {
        label: 'Step 2 (A waits)',
        txBadge: 'LOCKED',
        activeDualStep: 2,
        tables: [
          {
            title: 'Wait Graph',
            columns: ['session', 'holds', 'waiting_for'],
            rows: [
              [{ value: 'Window A' }, { value: 'id = 1' }, { value: 'id = 2 (held by B)', tone: 'changed' }],
              [{ value: 'Window B' }, { value: 'id = 2' }, { value: '—' }],
            ],
          },
        ],
        console: [{ text: 'Window A paused waiting for id = 2', tone: 'warn' }],
      },
      {
        label: 'Step 3 (40P01 Deadlock!)',
        txBadge: 'DEADLOCK',
        activeDualStep: 3,
        tables: [
          {
            title: 'Cycle Broken by Postgres',
            badge: 'SQLSTATE 40P01',
            columns: ['session', 'outcome'],
            rows: [
              [{ value: 'Window A (Survivor)' }, { value: 'Unblocked -> COMMIT (both rows +1)', tone: 'added' }],
              [{ value: 'Window B (Victim)' }, { value: 'Aborted (40P01) -> ROLLBACK', tone: 'error' }],
            ],
          },
        ],
        console: [
          { text: 'ERROR 40P01: deadlock detected (Process A <-> Process B)', tone: 'error' },
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
    tag: 'Pro Pattern · CTE + RETURNING',
    title: 'Atomic Booking — Sell the Last Karaoke Ticket',
    hint: 'Conditional UPDATE only claims a seat when seats_left > 0. RETURNING feeds that seat straight into INSERT.',
    expect: 'First run books Captain Noodle. A second concurrent attempt inserts 0 rows — zero double-booking!',
    filename: '14_last_karaoke_ticket.sql',
    mode: 'single',
    sql: `BEGIN;

WITH claimed AS (
  UPDATE shows SET seats_left = seats_left - 1
  WHERE id = 1 AND seats_left > 0
  RETURNING id
)
INSERT INTO bookings (show_id, guest)
SELECT id, 'Captain Noodle' FROM claimed
RETURNING id, guest;

COMMIT;`,
    steps: [
      {
        label: '1st Guest (1 seat left)',
        txBadge: 'COMMITTED',
        highlightLines: [1, 3, 4, 5, 6, 7, 8, 9, 10, 12],
        tables: [
          {
            title: 'shows',
            columns: ['id', 'seats_left'],
            rows: [[{ value: '1' }, { value: '0 (was 1)', tone: 'changed' }]],
          },
          {
            title: 'RETURNING id, guest',
            badge: '1 ROW BOOKED',
            columns: ['id', 'guest'],
            rows: [[{ value: '1', tone: 'added' }, { value: 'Captain Noodle', tone: 'added' }]],
          },
        ],
        console: [
          { text: 'RETURNING -> (1, Captain Noodle)', tone: 'success' },
          { text: 'COMMIT', tone: 'success' },
        ],
      },
      {
        label: '2nd Guest (0 seats left!)',
        txBadge: 'COMMITTED',
        highlightLines: [4, 5, 8, 9],
        tables: [
          {
            title: 'shows',
            columns: ['id', 'seats_left'],
            rows: [[{ value: '1' }, { value: '0' }]],
          },
          {
            title: 'RETURNING id, guest (2nd attempt)',
            badge: 'NO DOUBLE-BOOKING',
            columns: ['id', 'guest'],
            rows: [[{ value: '(0 rows)', tone: 'muted' }, { value: 'Sold out!', tone: 'error' }]],
          },
        ],
        console: [
          { text: 'claimed CTE returned 0 rows -> INSERT 0 0', tone: 'warn' },
          { text: 'COMMIT (No overbooking possible!)', tone: 'success' },
        ],
      },
    ],
  },

  {
    id: 15,
    code: '15',
    module: 'm5',
    difficulty: 'Boss',
    tag: 'Pro Pattern · Safe Cancel',
    title: 'Cancel Safely — No Magical Extra Seats',
    hint: 'Only increment seats_left when DELETE actually removes a real booking. Re-running cannot invent phantom seats.',
    expect: 'First cancel restores 1 seat. Repeating the query updates 0 rows — no imaginary seats appear!',
    filename: '15_safe_cancel_cte.sql',
    mode: 'single',
    sql: `BEGIN;

WITH removed AS (
  DELETE FROM bookings
  WHERE show_id = 1 AND guest = 'Captain Noodle'
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
        label: '1st Cancel (Real booking)',
        txBadge: 'COMMITTED',
        highlightLines: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14],
        tables: [
          {
            title: 'bookings',
            columns: ['id', 'guest'],
            rows: [[{ value: '(deleted)', tone: 'muted' }, { value: 'Captain Noodle', tone: 'error' }]],
          },
          {
            title: 'RETURNING s.seats_left',
            badge: 'RESTORED',
            columns: ['seats_left'],
            rows: [[{ value: '1 (0 -> 1)', tone: 'added' }]],
          },
        ],
        console: [
          { text: 'DELETE 1 -> UPDATE 1 -> seats_left = 1', tone: 'success' },
          { text: 'COMMIT', tone: 'success' },
        ],
      },
      {
        label: '2nd Cancel (Double-click!)',
        txBadge: 'COMMITTED',
        highlightLines: [4, 5, 8, 9],
        tables: [
          {
            title: 'shows',
            badge: 'SAFE (NO PHANTOM SEATS)',
            columns: ['id', 'seats_left'],
            rows: [[{ value: '1' }, { value: '1 (unchanged)', tone: 'added' }]],
          },
        ],
        console: [
          { text: 'removed CTE returned 0 rows -> UPDATE 0', tone: 'warn' },
          { text: 'COMMIT (Still 1 seat, never 2!)', tone: 'success' },
        ],
      },
    ],
  },
];

// --- Isolation Levels Cheat Sheet ---
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
