#!/bin/bash

echo "🧪 Preparando ambiente de testes E2E..."

# Load test environment variables
export NODE_ENV=test
export DATABASE_URL="mysql://root:password@localhost:3306/fidlink_test"

# Check if .env.test exists, create if not
if [ ! -f .env.test ]; then
    echo "📝 Criando arquivo .env.test..."
    cat > .env.test << EOL
# Test Environment
DATABASE_URL="mysql://root:password@localhost:3306/fidlink_test"
NODE_ENV=test
PORT=3001
EOL
fi

# Check if MySQL is running
echo "🔍 Verificando se MySQL está rodando..."
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL não encontrado. Tentando usar Docker..."
    
    # Check if docker is running
    if ! docker info &> /dev/null; then
        echo "❌ Docker não está rodando. Inicie o Docker Desktop e tente novamente."
        echo "💡 Ou instale o MySQL localmente."
        exit 1
    fi
    
    echo "🐳 Iniciando MySQL com Docker..."
    docker compose up -d mysql
    
    # Wait for MySQL to be ready
    echo "⏳ Aguardando MySQL ficar pronto..."
    sleep 10
fi

# Create test database if it doesn't exist
echo "🗄️  Configurando banco de dados de teste..."
mysql -h localhost -P 3306 -u root -ppassword -e "CREATE DATABASE IF NOT EXISTS fidlink_test;" 2>/dev/null || {
    echo "⚠️  Não foi possível conectar ao MySQL diretamente."
    echo "🐳 Tentando via Docker..."
    docker compose exec mysql mysql -u root -ppassword -e "CREATE DATABASE IF NOT EXISTS fidlink_test;" 2>/dev/null || {
        echo "❌ Erro ao criar banco de teste. Verifique se o MySQL está rodando."
        exit 1
    }
}

# Set environment for tests
export DATABASE_URL="mysql://root:password@localhost:3306/fidlink_test"

# Run database migrations for test database
echo "🚀 Executando migrations no banco de teste..."
npx prisma migrate deploy || {
    echo "❌ Erro ao executar migrations. Tentando prisma db push..."
    npx prisma db push --force-reset || {
        echo "❌ Erro ao configurar banco de teste."
        exit 1
    }
}

# Generate Prisma client
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Run e2e tests
echo "🧪 Executando testes E2E..."
if [ "$1" = "--watch" ]; then
    npm run test:e2e:watch
elif [ "$1" = "--coverage" ]; then
    npm run test:e2e:cov
else
    npm run test:e2e
fi

# Cleanup
echo "🧹 Limpeza pós-testes..."
mysql -h localhost -P 3306 -u root -ppassword -e "DROP DATABASE IF EXISTS fidlink_test;" 2>/dev/null || \
docker compose exec mysql mysql -u root -ppassword -e "DROP DATABASE IF EXISTS fidlink_test;" 2>/dev/null || \
echo "⚠️  Não foi possível limpar banco de teste automaticamente."

echo "✅ Testes E2E concluídos!"
