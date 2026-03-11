Feature: UX/Visual (tema, visualização, collapse e overlay mobile)

  Background:
    Given que estou na aplicação do conversor
    And que eu limpo o estado da aplicação

  @smoke @ux
  Scenario: Toggle de tema persiste após reload
    When eu guardo o tema atual
    And eu alterno o tema
    Then o tema deve ter mudado
    When eu recarrego a página
    Then o tema deve permanecer o mesmo após reload

  @regression @ux
  Scenario: Alternar visualização de cenários (blocks <-> rows) altera classe do container
    Then a visualização de cenários deve estar em "blocks"
    When eu alterno a visualização de cenários
    Then a visualização de cenários deve estar em "rows"

  @regression @ux
  Scenario: Collapse do header oculta/mostra campos do topo
    Then os campos do topo devem estar visíveis
    When eu colapso os campos do topo
    Then os campos do topo devem estar ocultos

  @regression @ux
  Scenario: Overlay de mobile aparece em viewport pequeno
    When eu ajusto o viewport para 800 por 700
    Then devo ver o overlay de mobile com o título "Tela pequena não suportada"

  @regression @ux
  Scenario: Collapse do header persiste após reload
    When eu colapso os campos do topo
    And eu recarrego a página
    Then os campos do topo devem estar ocultos
