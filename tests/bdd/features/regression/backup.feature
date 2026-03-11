Feature: Backup (export/import) e indicador de pendência (warn/danger)

  Background:
    Given que estou na aplicação do conversor
    And que eu limpo o estado da aplicação

  @smoke @backup
  Scenario: Exportar backup baixa arquivo .json e limpa pendência
    When eu aguardo o baseline de backup ficar pronto
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu simulo tentativa de sair para exibir indicador de backup pendente
    Then o botão de backup deve exibir "Backup pendente"
    When eu faço backup e baixo o arquivo
    Then o download do backup deve ter extensão ".json"

  @regression @backup
  Scenario: Mudança de configurações (tema) é warn (amarelo) e edição de cenário é danger (vermelho)
    When eu aguardo o baseline de backup ficar pronto
    And eu alterno o tema
    And eu simulo tentativa de sair para exibir indicador de backup pendente
    Then o botão de backup deve estar em estado "warn"
    When eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu simulo tentativa de sair para exibir indicador de backup pendente
    Then o botão de backup deve estar em estado "danger"

  @regression @backup
  Scenario: Restaurar backup com estado sujo pede confirmação e restaura cenários
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu faço backup e baixo o arquivo
    # Sujar o estado
    When eu preencho o título do cenário 1 com "Cenário alterado"
    And eu restauro o backup baixado
    Then devo ver o título do cenário 1 como "Cenário"
    And devo ver o Gherkin do cenário 1 contendo "Given a"

  @regression @backup
  Scenario: Restaurar backup em estado limpo não exige confirmação
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário limpo"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu faço backup e baixo o arquivo
    And que eu limpo o estado da aplicação
    And eu restauro o backup baixado
    Then devo ver o título do cenário 1 como "Cenário limpo"
