# 🚀 Pull Request

## 📋 Descrição

<!-- Descreva brevemente as mudanças implementadas neste PR -->

### 🎯 Tipo de Mudança

<!-- Marque o tipo de mudança -->

- [ ] 🐛 Bug fix (mudança que não quebra funcionalidade existente e corrige um problema)
- [ ] ✨ Nova funcionalidade (mudança que não quebra funcionalidade existente e adiciona nova feature)
- [ ] 💥 Breaking change (mudança que quebra funcionalidade existente)
- [ ] 📚 Documentação (mudanças apenas na documentação)
- [ ] 🎨 Refatoração (mudança de código que não corrige bugs nem adiciona funcionalidades)
- [ ] ⚡ Performance (mudança que melhora performance)
- [ ] 🧪 Testes (adicionar ou corrigir testes)
- [ ] 🔧 Chore (mudanças no processo de build, ferramentas auxiliares, etc)

## 🔗 Issue Relacionada

<!-- Se este PR resolve uma issue, referencie ela aqui -->
Closes #(número da issue)

## 🧪 Como Testar

<!-- Descreva como testar as mudanças implementadas -->

### Passos para Testar:

1. Clone o repositório
2. Faça checkout desta branch: `git checkout feature/branch-name`
3. Instale as dependências: `npm install`
4. Execute os testes: `npm test`
5. Inicie a aplicação: `npm run start:dev`
6. Teste a funcionalidade:
   ```bash
   # Exemplo de comando para testar
   curl -X POST http://localhost:3000/endpoint \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

### Resultado Esperado:

<!-- Descreva o resultado esperado dos testes -->

## 📸 Screenshots (se aplicável)

<!-- Adicione screenshots que ajudem a explicar as mudanças -->

## ✅ Checklist

### Desenvolvimento

- [ ] Meu código segue as diretrizes de estilo do projeto
- [ ] Realizei uma auto-revisão do meu código
- [ ] Comentei partes complexas do código
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que cobrem minhas mudanças
- [ ] Todos os testes novos e existentes passam localmente

### Testes

- [ ] ✅ Testes unitários passam (`npm test`)
- [ ] ✅ Testes E2E passam (`npm run test:e2e:mock`)
- [ ] ✅ Linting passa (`npm run lint`)
- [ ] ✅ Build é bem-sucedido (`npm run build`)
- [ ] ✅ Cobertura de testes é adequada

### Documentação

- [ ] Atualizei a documentação relevante
- [ ] Atualizei o README.md se necessário
- [ ] Atualizei exemplos de uso se aplicável
- [ ] Adicionei comentários no código quando necessário

### API Changes (se aplicável)

- [ ] Documentei mudanças na API no `API_GUIDE.md`
- [ ] Atualizei exemplos de cURL em `curl-examples.txt`
- [ ] Atualizei coleção do Postman se necessário
- [ ] Considerei retrocompatibilidade

## 🚨 Breaking Changes (se aplicável)

<!-- Se este PR introduz breaking changes, descreva-os aqui -->

### O que mudou:

<!-- Descreva exatamente o que quebra a compatibilidade -->

### Impacto:

<!-- Descreva o impacto nas aplicações que usam a API -->

### Migração:

<!-- Forneça instruções de migração -->

## 📝 Notas Adicionais

<!-- Qualquer informação adicional que seja útil para os revisores -->

### Para os Revisores:

<!-- Informações específicas para quem vai revisar o código -->

- [ ] Foquem na parte X do código
- [ ] Prestem atenção especial à funcionalidade Y
- [ ] Este PR depende de #(número da issue/PR)

### Considerações Especiais:

<!-- Qualquer consideração especial sobre as mudanças -->

---

## 📊 Métricas (automático)

<!-- Esta seção será preenchida automaticamente pelos workflows do GitHub -->

- **Cobertura de Testes:** Em breve
- **Bundle Size:** Em breve
- **Performance:** Em breve

---

**🙏 Obrigado por contribuir com o FidLink API!**
