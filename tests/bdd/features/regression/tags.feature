Feature: Tags (criar, atribuir e filtrar)

  Background:
    Given que estou na aplicação do conversor
    And que eu limpo o estado da aplicação

  @smoke @tags
  Scenario: Criar tag e atribuir ao cenário
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário 1"
    And eu abro o seletor de tags do cenário 1
    And eu crio uma nova tag "Smoke"
    Then o botão de tags do cenário 1 deve mostrar "Smoke"
    And devo ver a aba de filtro de tags contendo "Smoke"

  @regression @tags
  Scenario: Filtrar cenários por tag oculta cenários sem a tag
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu adiciono um cenário
    And eu preencho o título do cenário 1 com "Com tag"
    And eu preencho o título do cenário 2 com "Sem tag"
    And eu abro o seletor de tags do cenário 1
    And eu crio uma nova tag "Regression"
    When eu filtro cenários pela tag "Regression"
    Then devo ver apenas 1 cenário visível

  @regression @tags
  Scenario: Remover tag de um cenário atualiza o botão de tags
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Com tag"
    And eu abro o seletor de tags do cenário 1
    And eu crio uma nova tag "Temp"
    Then o botão de tags do cenário 1 deve mostrar "Temp"
    When eu abro o seletor de tags do cenário 1
    And eu desmarco a tag "Temp" do cenário 1
    Then o botão de tags do cenário 1 não deve mostrar "Temp"

  @regression @tags
  Scenario: Tags persistem após reload da página
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Com tag"
    And eu abro o seletor de tags do cenário 1
    And eu crio uma nova tag "Persistente"
    When eu recarrego a página
    Then devo ver a aba de filtro de tags contendo "Persistente"
