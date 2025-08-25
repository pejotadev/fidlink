#!/bin/bash

echo "🚀 Configurando FidLink API..."

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

echo "✅ Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Certifique-se de que o MySQL está rodando"
echo "2. Configure a DATABASE_URL no arquivo .env"
echo "3. Execute: npm run db:migrate"
echo "4. Inicie o servidor: npm run start:dev"
echo ""
echo "🐳 Para usar Docker:"
echo "1. Inicie o Docker Desktop"
echo "2. Execute: docker compose up -d"
echo ""
