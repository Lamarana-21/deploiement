const { query } = require('../db');

async function testContactMessages() {
  try {
    // Test 1: Vérifier si la table existe
    const tables = await query('SHOW TABLES LIKE "contact_messages"');
    console.log('1. Table existe:', tables.length > 0);

    // Test 2: Compter les messages
    const countResult = await query('SELECT COUNT(*) as total FROM contact_messages');
    console.log('2. Nombre de messages:', countResult[0].total);

    // Test 3: Récupérer les messages
    const messages = await query('SELECT * FROM contact_messages LIMIT 5');
    console.log('3. Messages:', JSON.stringify(messages, null, 2));

    // Test 4: Tester la requête exacte utilisée dans la route
    const sql = `
      SELECT 
        cm.*,
        u.fullname as replied_by_name
      FROM contact_messages cm
      LEFT JOIN users u ON cm.replied_by = u.id
      WHERE 1=1
      ORDER BY cm.created_at DESC LIMIT 50 OFFSET 0
    `;
    const result = await query(sql);
    console.log('4. Requête route GET:', result.length, 'messages');

    // Test 5: Compter par statut
    const countsSql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read_count,
        SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived
      FROM contact_messages
    `;
    const counts = await query(countsSql);
    console.log('5. Comptages:', JSON.stringify(counts[0]));

    console.log('\n✅ Tous les tests passent!');
  } catch (err) {
    console.error('❌ ERREUR:', err.message);
    console.error('Stack:', err.stack);
  } finally {
    process.exit();
  }
}

testContactMessages();
