Feature: Configuração inline (campos padrão vs variáveis por cenário)

  Background:
    Given que estou na aplicação do conversor
    And que eu limpo o estado da aplicação

  @smoke @inline-config
  Scenario: Tornar Projeto variável por cenário remove campo do topo e exige preenchimento por cenário
    When eu defino o campo "project" do topo como variável por cenário
    And eu preencho o repositório do cabeçalho com "Squad/Feature"
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu clico em Gerar JSON
    Then devo ver o erro "O campo \"Projeto\" do cenário #1 é obrigatório."

  @regression @inline-config
  Scenario: Projeto variável por cenário valida regra de 4 letras por cenário
    When eu defino o campo "project" do topo como variável por cenário
    And eu preencho o repositório do cabeçalho com "Squad/Feature"
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu preencho o Projeto do cenário 1 com "ABC"
    And eu clico em Gerar JSON
    Then devo ver o erro "O campo \"Projeto\" do cenário #1 deve conter 4 letras."

  @regression @inline-config
  Scenario: Repositório variável por cenário valida presença de "/" por cenário
    When eu preencho o projeto do cabeçalho com "ABCD"
    And eu defino o campo "folder" do topo como variável por cenário
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu preencho o Repositório do cenário 1 com "SemBarra"
    And eu clico em Gerar JSON
    Then devo ver o erro "O campo \"Repositorio\" do cenário #1 deve conter \"/\"."

  @regression @inline-config
  Scenario: Voltar campo para padrão apaga valores por cenário com confirmação
    When eu defino o campo "project" do topo como variável por cenário
    And eu preencho o repositório do cabeçalho com "Squad/Feature"
    And eu preencho o Projeto do cenário 1 com "ABCD"
    And eu volto o campo "Projeto" do cenário 1 para padrão
    Then devo ver o campo "project" visível no topo
