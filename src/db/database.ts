import {enablePromise, openDatabase} from 'react-native-sqlite-storage';

// Enable promise for SQLite
enablePromise(true); //switches library to promise api instead of callback api

//returns ready to use database object
export const connectToDatabase = async (): Promise<SQLiteDatabase> => {
  try {
    const db = await openDatabase({name: 'book.db', location: 'default'});
    console.log('✅ Database connection successful');
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    throw error;
  }
};

//create table file add query to create table in this
export const createTables = async (db: SQLiteDatabase) => {
  const contactsQuery = `
   CREATE TABLE IF NOT EXISTS Contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      name TEXT,
      phoneNumber TEXT
   )
  `;

  try {
    //await db.executeSql(userPreferencesQuery);
    await db.executeSql(contactsQuery);
    //await db.executeSql(testTableQuery);
  } catch (error) {
    console.error(error);
    throw Error(`Failed to create tables`);
  }
};

export const createTranslationTable = async (db: SQLiteDatabase) => {
  const createQuery = `CREATE TABLE IF NOT EXISTS translations (
  key TEXT PRIMARY KEY,
  de TEXT,
  dz TEXT,
  el TEXT,
  es TEXT,
  fr TEXT,
  gu TEXT,
  hi TEXT,
  it TEXT,
  ja TEXT,
  la TEXT,
  ml TEXT,
  nl TEXT,
  ta TEXT,
  en TEXT
) `;

  try {
    await db.executeSql(createQuery);
  } catch (error) {
    console.error(error);
    throw Error(`Failed to create translation tables`);
  }
};

export const getTableNames = async (db: SQLiteDatabase): Promise<string[]> => {
  try {
    const tableNames: string[] = [];
    const results = await db.executeSql(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    );
    results?.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        tableNames.push(result.rows.item(index).name);
      }
    });
    return tableNames;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get table names from database');
  }
};

export const removeTable = async (db: SQLiteDatabase, tableName: Table) => {
  const query = `DROP TABLE IF EXISTS ${tableName}`;
  try {
    await db.executeSql(query);
  } catch (error) {
    console.error(error);
    throw Error(`Failed to drop table ${tableName}`);
  }
};
