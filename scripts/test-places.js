const axios = require('axios');

async function testPlacesService() {
  console.log('🧪 Probando el Microservicio de Places a través del Gateway...\n');

  const gatewayUrl = 'http://localhost:3000';
  const placesBaseUrl = `${gatewayUrl}/api/places`;

  // Test 1: Verificar que el gateway esté funcionando
  try {
    console.log('1. Verificando que el gateway esté funcionando...');
    const response = await axios.get(`${gatewayUrl}/`);
    console.log('✅ Gateway funcionando:', response.data.name);
  } catch (error) {
    console.log('❌ Gateway no está funcionando:', error.message);
    return;
  }

  // Test 2: Obtener lugares cercanos (sin autenticación)
  try {
    console.log('\n2. Probando obtener lugares cercanos...');
    const response = await axios.get(`${placesBaseUrl}/nearby`, {
      params: {
        lat: -12.0464,
        lng: -77.0428,
        radius: 1000
      }
    });
    console.log('✅ Lugares cercanos obtenidos:', response.status);
    console.log('📄 Datos:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error obteniendo lugares cercanos:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('📄 Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }

  // Test 3: Obtener todos los lugares (sin autenticación)
  try {
    console.log('\n3. Probando obtener todos los lugares...');
    const response = await axios.get(`${placesBaseUrl}`);
    console.log('✅ Todos los lugares obtenidos:', response.status);
    console.log('📄 Total de lugares:', response.data.length || 'No especificado');
  } catch (error) {
    console.log('❌ Error obteniendo todos los lugares:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('📄 Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }

  // Test 4: Obtener un lugar específico (sin autenticación)
  try {
    console.log('\n4. Probando obtener lugar específico (ID: 1)...');
    const response = await axios.get(`${placesBaseUrl}/1`);
    console.log('✅ Lugar obtenido:', response.status);
    console.log('📄 Datos del lugar:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error obteniendo lugar específico:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('📄 Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }

  // Test 5: Prueba de conectividad directa al microservicio
  try {
    console.log('\n5. Probando conectividad directa al microservicio de Places...');
    const response = await axios.get('https://kaminoapiplacesservice-production.up.railway.app/api/v1/places', {
      timeout: 10000
    });
    console.log('✅ Microservicio Places accesible directamente:', response.status);
  } catch (error) {
    console.log('❌ Microservicio Places no accesible directamente:', error.message);
  }

  console.log('\n✅ Pruebas de Places Service completadas');
}

testPlacesService().catch(console.error);