export const addContact = async (db: SQLiteDatabase, contact: Contact) => {
  const insertQuery = `
   INSERT INTO Contacts (firstName, name, phoneNumber)
   VALUES (?, ?, ?)
 `;
  const values = [contact.firstName, contact.name, contact.phoneNumber];
  try {
    return db.executeSql(insertQuery, values);
  } catch (error) {
    console.error(error);
    throw Error('Failed to add contact');
  }
};

export const getContacts = async (db: SQLiteDatabase): Promise<Contact[]> => {
  try {
    const contacts: Contact[] = [];
    const results = await db.executeSql('SELECT * FROM Contacts');
    results?.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        contacts.push(result.rows.item(index));
      }
    });
    return contacts;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get Contacts from database');
  }
};

export const removeContact = async (
  db: SQLiteDatabase,
  id: number,
): Promise<void> => {
  const deleteQuery = `DELETE FROM Contacts WHERE id = ?`;
  try {
    await db.executeSql(deleteQuery, [id]);
  } catch (error) {
    console.error(error);
    throw Error(`Failed to delete contact with id ${id}`);
  }
};

export const updateContact = async (
  db: SQLiteDatabase,
  contact: Contact,
): Promise<void> => {
  const updateQuery = `
    UPDATE Contacts
    SET firstName = ?, name = ?, phoneNumber = ?
    WHERE id = ?
  `;
  const values = [
    contact.firstName,
    contact.name,
    contact.phoneNumber,
    contact.id,
  ];

  try {
    await db.executeSql(updateQuery, values);
  } catch (error) {
    console.error(error);
    throw Error(`Failed to update contact with id ${contact.id}`);
  }
};
