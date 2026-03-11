Feature: Exportar Planilha (CSV)

  Background:
    Given que estou na aplicação do conversor
    And que eu limpo o estado da aplicação

  @smoke @spreadsheet
  Scenario: Exportar CSV gera chip e download
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu gero a planilha CSV
    Then deve existir um chip de arquivo CSV gerado
    When eu baixo o CSV gerado
    Then o download do CSV deve ter extensão ".csv"

  @regression @spreadsheet
  Scenario: Exportar CSV com responsável preenchido exibe aviso e gera arquivo
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o responsável do topo com "account-id-123"
    And eu preencho o título do cenário 1 com "Cenário"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    When eu gero a planilha CSV (com aviso)
    Then deve abrir um aviso de exportação por planilha informando que responsável não é suportado
    And deve existir um chip de arquivo CSV gerado

  @regression @spreadsheet
  Scenario: CSV exportado contém colunas obrigatórias separadas por ponto-e-vírgula
    When eu preencho o cabeçalho obrigatório (Projeto e Repositório)
    And eu preencho o título do cenário 1 com "Cenário CSV"
    And eu preencho o Gherkin do cenário 1 com:
      """
      Given a
      When b
      Then c
      """
    And eu gero a planilha CSV
    And eu baixo o CSV gerado
    Then o conteúdo do CSV deve conter o cabeçalho "Test Summary"
    And o conteúdo do CSV deve conter delimitador ";"
