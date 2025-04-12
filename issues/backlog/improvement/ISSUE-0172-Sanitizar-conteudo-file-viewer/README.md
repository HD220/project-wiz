# Sanitizar conteúdo exibido no FileViewer para mitigar riscos de XSS

## Contexto

O componente `src/client/components/file-viewer.tsx` exibe conteúdo dinâmico dentro de um elemento `<pre>`. Embora o código siga os princípios de Clean Code, Clean Architecture e as ADRs do projeto, existe um risco potencial de XSS caso o conteúdo exibido não seja proveniente de fonte totalmente confiável.

Trecho relevante:
```tsx
<pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md">
  {content}
</pre>
```

## Justificativa

Esta melhoria é preventiva e opcional, visando reforçar a segurança do frontend em cenários de edge case. A sanitização do conteúdo exibido pode evitar ataques de XSS caso, futuramente, a origem do conteúdo se torne variável ou não controlada.

## Recomendação

- Avaliar a origem do conteúdo passado para o componente.
- Se houver qualquer possibilidade de entrada não confiável, implementar sanitização utilizando uma biblioteca reconhecida (exemplo: DOMPurify).
- Garantir que a solução não afete a experiência do usuário ou a performance do componente.

## Checklist de Ações

- [ ] Analisar a origem e fluxo do conteúdo exibido no FileViewer.
- [ ] Decidir sobre a real necessidade de sanitização, documentando a decisão.
- [ ] Se necessário, implementar sanitização do conteúdo antes da renderização.
- [ ] Adicionar ou atualizar testes para cobrir cenários de conteúdo potencialmente malicioso.
- [ ] Atualizar a documentação técnica, se aplicável.
- [ ] Revisar e validar a solução com foco em segurança e usabilidade.

---

## Progresso / Handoff

- _Utilize este espaço para registrar decisões, dificuldades, links de PRs, e próximos passos durante a execução da melhoria._