const jwt = require('jsonwebtoken');

// Configuración del token
const secret = process.env.JWT_SECRET || 'default-secret-key';
const payload = {
  sub: '12345',
  id: '12345',
  email: 'test@example.com',
  roles: ['user'],
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 horas
};

// Generar token
const token = jwt.sign(payload, secret);

console.log('JWT Token generado:');
console.log(token);
console.log('\nPuedes usar este token en el header Authorization:');
console.log(`Authorization: Bearer ${token}`);
console.log('\nEl token expira en 24 horas.');
console.log('\nPayload del token:');
console.log(JSON.stringify(payload, null, 2));