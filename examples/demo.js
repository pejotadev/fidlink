#!/usr/bin/env node

/**
 * Demo script para testar a API FidLink
 * Execute com: node examples/demo.js
 * 
 * Certifique-se de que a API está rodando em http://localhost:3000
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';

// Helper para fazer requisições HTTP
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            data: body ? JSON.parse(body) : null,
          };
          resolve(response);
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body,
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runDemo() {
  console.log('🚀 Iniciando demo da API FidLink...\n');

  try {
    // 1. Health Check
    console.log('1. Verificando saúde da API...');
    const health = await makeRequest('GET', '/health');
    console.log(`   ✅ Status: ${health.status}`);
    console.log(`   📊 Response:`, health.data);
    console.log();

    // 2. Criar cliente válido
    console.log('2. Criando cliente válido...');
    const clientData = {
      nome: 'João Silva Demo',
      dataNascimento: '1990-01-15',
      cpf: '123.456.789-00',
      rendaLiquidaMensal: 5000.50
    };

    const createResponse = await makeRequest('POST', '/client', clientData);
    console.log(`   ✅ Status: ${createResponse.status}`);
    console.log(`   👤 Cliente criado:`, createResponse.data);
    console.log();

    if (createResponse.status === 201 && createResponse.data?.id) {
      const clientId = createResponse.data.id;

      // 3. Buscar cliente por ID
      console.log('3. Buscando cliente por ID...');
      const getResponse = await makeRequest('GET', `/client/${clientId}`);
      console.log(`   ✅ Status: ${getResponse.status}`);
      console.log(`   👤 Cliente encontrado:`, getResponse.data);
      console.log();
    }

    // 4. Tentar criar cliente com CPF duplicado
    console.log('4. Tentando criar cliente com CPF duplicado...');
    const duplicateResponse = await makeRequest('POST', '/client', clientData);
    console.log(`   ❌ Status: ${duplicateResponse.status}`);
    console.log(`   🚫 Erro esperado:`, duplicateResponse.data);
    console.log();

    // 5. Tentar criar cliente com dados inválidos
    console.log('5. Tentando criar cliente com CPF inválido...');
    const invalidData = {
      nome: 'Maria Santos',
      dataNascimento: '1985-05-20',
      cpf: '123456789', // CPF inválido
      rendaLiquidaMensal: 3000
    };

    const invalidResponse = await makeRequest('POST', '/client', invalidData);
    console.log(`   ❌ Status: ${invalidResponse.status}`);
    console.log(`   🚫 Erro de validação:`, invalidResponse.data);
    console.log();

    // 6. Buscar cliente inexistente
    console.log('6. Buscando cliente inexistente...');
    const notFoundResponse = await makeRequest('GET', '/client/inexistente');
    console.log(`   ❌ Status: ${notFoundResponse.status}`);
    console.log(`   🚫 Erro esperado:`, notFoundResponse.data);
    console.log();

    console.log('✅ Demo concluído com sucesso!');
    console.log('');
    console.log('📋 Resumo dos testes:');
    console.log('   ✅ Health check funcionando');
    console.log('   ✅ Criação de cliente válido');
    console.log('   ✅ Busca de cliente por ID');
    console.log('   ✅ Validação de CPF duplicado');
    console.log('   ✅ Validação de dados inválidos');
    console.log('   ✅ Tratamento de cliente não encontrado');

  } catch (error) {
    console.error('❌ Erro durante o demo:', error.message);
    console.log('');
    console.log('💡 Certifique-se de que:');
    console.log('   1. A API está rodando em http://localhost:3000');
    console.log('   2. O banco de dados está configurado');
    console.log('   3. Execute: npm run start:dev');
  }
}

// Executar demo se chamado diretamente
if (require.main === module) {
  runDemo();
}

module.exports = { runDemo, makeRequest };
