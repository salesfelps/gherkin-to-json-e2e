Feature: Importar cenários (JSON e CSV)

  Background:
    Given que estou na aplicação do conversor
    And que eu limpo o estado da aplicação

  @smoke @import
  Scenario: Exportar JSON e importar o mesmo arquivo restaura cenários
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu adiciono um cenário
    And eu preencho o título do cenário 1 com "Cenário 1"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu preencho o título do cenário 2 com "Cenário 2"
    And eu preencho o Gherkin do cenário 2 com:
      """
      Given a2
      When b2
      Then c2
      """
    And eu clico em Gerar JSON
    And eu baixo o JSON gerado
    When eu importo este JSON baixado
    Then devo ver 2 cenários na tela

  @regression @import
  Scenario: Exportar CSV e importar o mesmo arquivo restaura cenários
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu adiciono um cenário
    And eu preencho o título do cenário 1 com "Cenário 1"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu preencho o título do cenário 2 com "Cenário 2"
    And eu preencho o Gherkin do cenário 2 com:
      """
      Given a2
      When b2
      Then c2
      """
    And eu gero a planilha CSV
    And eu baixo o CSV gerado
    When eu importo este CSV baixado
    Then devo ver 2 cenários na tela

  @regression @import
  Scenario: Importar JSON inválido mostra mensagem "JSON inválido."
    When eu tento importar o JSON inválido "invalid.json"
    Then devo ver a notificação de importação com erro "JSON inválido."

  @regression @import
  Scenario: Importar CSV com formato não suportado mostra mensagem específica
    When eu tento importar o CSV inválido "invalid-extension.txt"
    Then devo ver a notificação de importação com erro "Formato de arquivo não suportado. Escolha um arquivo .csv (UTF-8)."

  @regression @import
  Scenario: Importar CSV sem cabeçalho de Summary mostra mensagem específica
    When eu tento importar o CSV inválido "missing-summary.csv"
    Then devo ver a notificação de importação com erro "Cabeçalho da planilha deve conter a coluna \"Test Summary\" (ou equivalente)."

  @regression @import
  Scenario: Importar JSON sobrescreve cenários existentes
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Original"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu clico em Gerar JSON
    And eu baixo o JSON gerado
    # Sobrescrever com outro conteúdo
    When eu preencho o título do cenário 1 com "Alterado"
    And eu importo este JSON baixado
    Then devo ver o título do cenário 1 como "Original"
