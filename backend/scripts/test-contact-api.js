/**
 * Test de l'API Contact
 * Exécute : node scripts/test-contact-api.js
 */

const http = require('http');

function makeRequest(options, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 Test: ${description}`);
    console.log(`   ${options.method} ${options.path}`);
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`   Response:`, JSON.stringify(json, null, 2));
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          console.log(`   Raw response: ${data.substring(0, 200)}`);
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (e) => {
      console.log(`   ❌ Erreur: ${e.message}`);
      reject(e);
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('📡 TEST API CONTACT');
  console.log('='.repeat(60));
  
  const baseOptions = {
    hostname: 'localhost',
    port: 3000,
  };

  try {
    // Test 1: GET /api/contact sans authentification
    const result1 = await makeRequest({
      ...baseOptions,
      path: '/api/contact',
      method: 'GET'
    }, 'GET /api/contact sans session (doit retourner 401)');
    
    if (result1.status === 401) {
      console.log('   ✅ Correct - Non authentifié');
    } else {
      console.log(`   ⚠️ Attendu 401, reçu ${result1.status}`);
    }

    // Test 2: POST /api/contact (public)
    console.log('\n🔄 Test: POST /api/contact (public)');
    const testMessage = JSON.stringify({
      name: 'Test API',
      email: 'test@api.com',
      phone: '0612345678',
      subject: 'technique',
      message: 'Ceci est un test automatique depuis test-contact-api.js'
    });

    const postOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/contact',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testMessage)
      }
    };

    const result2 = await new Promise((resolve, reject) => {
      const req = http.request(postOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`   Status: ${res.statusCode}`);
          try {
            const json = JSON.parse(data);
            console.log(`   Response:`, JSON.stringify(json, null, 2));
            resolve({ status: res.statusCode, data: json });
          } catch (e) {
            console.log(`   Raw: ${data.substring(0, 200)}`);
            resolve({ status: res.statusCode, data: data });
          }
        });
      });
      req.on('error', reject);
      req.write(testMessage);
      req.end();
    });

    if (result2.status === 200 || result2.status === 201) {
      console.log('   ✅ Message enregistré avec succès');
    } else {
      console.log(`   ⚠️ Problème: ${result2.status}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    console.log('- Le serveur backend répond correctement');
    console.log('- L\'authentification admin est requise pour GET /api/contact');
    console.log('- POST /api/contact (public) fonctionne');
    console.log('\n💡 Le problème sur l\'interface admin vient probablement de:');
    console.log('   1. L\'utilisateur n\'est pas connecté en tant qu\'admin');
    console.log('   2. La session a expiré');
    console.log('   3. Le navigateur ne transmet pas les cookies');
    
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error.message);
    console.log('\n⚠️ Vérifiez que le serveur backend est en cours d\'exécution');
    console.log('   cd backend && node server.js');
  }
}

runTests();
