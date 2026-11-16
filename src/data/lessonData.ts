export type TxBadgeState =
  | 'IDLE'
  | 'ACTIVE'
  | 'COMMITTED'
  | 'ROLLED_BACK'
  | 'ABORTED'
  | 'SAVEPOINT'
  | 'LOCKED';

export interface SqlStep {
  highlightLines: number[];
  txState: TxBadgeState;
  label: string;
  terminalLines?: { text: string; tone: 'info' | 'success' | 'warn' | 'error' }[];
}

export interface AcidCardData {
  letter: string;
  title: string;
  tagline: string;
  accent: 'cyan' | 'emerald' | 'violet' | 'amber';
}

export const ACID_CARDS: AcidCardData[] = [
  {
    letter: 'A',
    title: 'Atomicity',
    tagline: 'All succeed, or all fail.',
    accent: 'cyan',
  },
  {
    letter: 'C',
    title: 'Consistency',
    tagline: 'Constraints never break.',
    accent: 'emerald',
  },
  {
    letter: 'I',
    title: 'Isolation',
    tagline: 'Transactions stay separated.',
    accent: 'violet',
  },
  {
    letter: 'D',
    title: 'Durability',
    tagline: 'Committed data survives crashes.',
    accent: 'amber',
  },
];

// --- Section 2: CS2 Economy ---
export const CS2_SQL = `BEGIN;

-- Subtract $4750 from 's1mple' to buy an AWP
UPDATE players
SET balance = balance - 4750
WHERE nickname = 's1mple';

INSERT INTO inventory (player, weapon)
VALUES ('s1mple', 'AWP');

COMMIT; -- Or ROLLBACK; to cancel the buy`;

export const CS2_STEPS_COMMIT: SqlStep[] = [
  {
    highlightLines: [1],
    txState: 'ACTIVE',
    label: 'BEGIN',
    terminalLines: [{ text: 'BEGIN', tone: 'info' }],
  },
  {
    highlightLines: [4, 5, 6],
    txState: 'ACTIVE',
    label: '-$4750',
    terminalLines: [
      { text: 'UPDATE 1  -- balance: $5200 -> $450 (uncommitted)', tone: 'warn' },
    ],
  },
  {
    highlightLines: [8, 9],
    txState: 'ACTIVE',
    label: '+AWP',
    terminalLines: [
      { text: 'INSERT 0 1 -- AWP staged in session buffer', tone: 'warn' },
    ],
  },
  {
    highlightLines: [11],
    txState: 'COMMITTED',
    label: 'COMMIT',
    terminalLines: [
      { text: 'COMMIT  -- Saved! Visible to all players on server.', tone: 'success' },
    ],
  },
];

export const CS2_STEPS_ROLLBACK: SqlStep[] = [
  {
    highlightLines: [1],
    txState: 'ACTIVE',
    label: 'BEGIN',
    terminalLines: [{ text: 'BEGIN', tone: 'info' }],
  },
  {
    highlightLines: [4, 5, 6],
    txState: 'ACTIVE',
    label: '-$4750',
    terminalLines: [
      { text: 'UPDATE 1  -- balance: $5200 -> $450 (uncommitted)', tone: 'warn' },
    ],
  },
  {
    highlightLines: [8, 9],
    txState: 'ACTIVE',
    label: '+AWP',
    terminalLines: [
      { text: 'INSERT 0 1 -- AWP staged in session buffer', tone: 'warn' },
    ],
  },
  {
    highlightLines: [11],
    txState: 'ROLLED_BACK',
    label: 'ROLLBACK',
    terminalLines: [
      { text: 'ROLLBACK -- Cancelled! $4750 refunded, no AWP.', tone: 'error' },
    ],
  },
];

// --- Section 3: Marvel Universe ---
export const MARVEL_SQL = `-- Table rule: stock INT CHECK (stock >= 0)
-- Current stock in Stark Armory: 10 suits

BEGIN;

INSERT INTO orders (hero, suit, qty)
VALUES ('Tony Stark', 'Mark LXXXV', 50);

UPDATE suits_stock
SET stock = stock - 50
WHERE model = 'Mark LXXXV';
-- ❌ ERROR: violates CHECK (stock >= 0)

COMMIT; -- Auto-aborted -> executes ROLLBACK`;

export const MARVEL_STEPS: SqlStep[] = [
  {
    highlightLines: [4],
    txState: 'ACTIVE',
    label: 'BEGIN',
    terminalLines: [{ text: 'BEGIN', tone: 'info' }],
  },
  {
    highlightLines: [6, 7],
    txState: 'ACTIVE',
    label: 'INSERT Order',
    terminalLines: [
      { text: 'INSERT 0 1 -- Order for 50 suits staged...', tone: 'warn' },
    ],
  },
  {
    highlightLines: [9, 10, 11, 12],
    txState: 'ABORTED',
    label: 'CHECK Error',
    terminalLines: [
      {
        text: 'ERROR:  new row for relation "suits_stock" violates check constraint "stock >= 0"',
        tone: 'error',
      },
      {
        text: 'DETAIL: Failing row contains (Mark LXXXV, -40). Only 10 left!',
        tone: 'error',
      },
    ],
  },
  {
    highlightLines: [14],
    txState: 'ROLLED_BACK',
    label: 'Auto ROLLBACK',
    terminalLines: [
      {
        text: 'WARNING: current transaction is aborted, commands ignored',
        tone: 'warn',
      },
      {
        text: 'ROLLBACK -- Order wiped too! 10 suits untouched.',
        tone: 'error',
      },
    ],
  },
];

// --- Section 4: Fantasy RPG Tavern ---
export const RPG_SQL = `BEGIN;

INSERT INTO orders (party, item)
VALUES ('Heroes', 'Buy 3 beers');

SAVEPOINT pre_brawl;

UPDATE tavern_inventory
SET chairs = chairs - 12, tables = tables - 4
WHERE event = 'Throw tables and break chairs';

ROLLBACK TO SAVEPOINT pre_brawl; -- Undo the damage

COMMIT; -- The party still gets the beers`;

export const RPG_STEPS: SqlStep[] = [
  {
    highlightLines: [1],
    txState: 'ACTIVE',
    label: 'BEGIN',
    terminalLines: [{ text: 'BEGIN', tone: 'info' }],
  },
  {
    highlightLines: [3, 4],
    txState: 'ACTIVE',
    label: 'Buy 3 Beers',
    terminalLines: [
      { text: 'INSERT 0 1 -- "Buy 3 beers" added to party order', tone: 'success' },
    ],
  },
  {
    highlightLines: [6],
    txState: 'SAVEPOINT',
    label: 'SAVEPOINT',
    terminalLines: [
      { text: 'SAVEPOINT pre_brawl -- Checkpoint saved!', tone: 'info' },
    ],
  },
  {
    highlightLines: [8, 9, 10],
    txState: 'ACTIVE',
    label: 'Tavern Brawl',
    terminalLines: [
      { text: 'UPDATE 1 -- Chairs: 0, Tables: 0 (Tavern wrecked!)', tone: 'error' },
    ],
  },
  {
    highlightLines: [12],
    txState: 'SAVEPOINT',
    label: 'ROLLBACK TO',
    terminalLines: [
      { text: 'ROLLBACK -- Reverted to pre_brawl. Furniture restored!', tone: 'warn' },
    ],
  },
  {
    highlightLines: [14],
    txState: 'COMMITTED',
    label: 'COMMIT',
    terminalLines: [
      { text: 'COMMIT -- Beers served, tavern intact!', tone: 'success' },
    ],
  },
];

// --- Section 5: Valorant Row Locks ---
export const VALORANT_SQL = `BEGIN;

SELECT status
FROM agents
WHERE name = 'Jett'
FOR UPDATE; -- Locks row; Player 2 waits

UPDATE agents
SET owner = 'Player1'
WHERE name = 'Jett';

COMMIT;`;

export const VALORANT_P2_SQL = `BEGIN;

SELECT status
FROM agents
WHERE name = 'Jett'
FOR UPDATE; -- ⏳ Waits for Player 1!`;

export const VALORANT_STEPS: SqlStep[] = [
  {
    highlightLines: [1],
    txState: 'ACTIVE',
    label: 'BEGIN',
    terminalLines: [{ text: 'Player 1: BEGIN', tone: 'info' }],
  },
  {
    highlightLines: [3, 4, 5, 6],
    txState: 'LOCKED',
    label: 'FOR UPDATE',
    terminalLines: [
      { text: "Player 1: Row lock acquired on ('Jett')", tone: 'success' },
      { text: 'Player 2: ⏳ BLOCKED waiting on row lock...', tone: 'warn' },
    ],
  },
  {
    highlightLines: [8, 9, 10],
    txState: 'LOCKED',
    label: 'UPDATE Jett',
    terminalLines: [
      { text: "Player 1: UPDATE 1 (owner = 'Player1')", tone: 'info' },
      { text: 'Player 2: ⏳ Still waiting...', tone: 'warn' },
    ],
  },
  {
    highlightLines: [12],
    txState: 'COMMITTED',
    label: 'COMMIT',
    terminalLines: [
      { text: "Player 1: COMMIT -- Jett locked by Player1!", tone: 'success' },
      { text: "Player 2: Unblocked -> sees owner = 'Player1'", tone: 'error' },
    ],
  },
];

// --- Section 6: Isolation Levels ---
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
