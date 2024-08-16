import { ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import {
  buildSuggestions,
  ExpressionBuilder,
  jsSearchIndex,
  LanguageName,
  Source,
} from '@cucumber/language-service'
import { WasmParserAdapter } from '@cucumber/language-service/wasm'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { ConfigureEditor, configureMonaco } from '../src/index.js'

async function makeConfigureEditor(): Promise<ConfigureEditor> {
  monaco.languages.register({ id: 'typescript' })

  const adapter = new WasmParserAdapter('.')
  await adapter.init()
  const expressionBuilder = new ExpressionBuilder(adapter)

  const sources: Source<LanguageName>[] = [
    {
      languageName: 'java',
      uri: 'file:///tmp/StepDefinitions.java',
      content: `class StepDefinitions {
    @Given("I have {int} cukes in my belly"  )
    void method1() {
    }

    @Given("there are {int} blind mice")
    void method2() {
    }

    @Given("there is/are some/none/1 apple(s)")
    void method2() {
    }
}
`,
    },
  ]

  const { expressionLinks, errors } = expressionBuilder.build(sources, [])
  for (const error of errors) {
    console.error(error)
  }
  const expressions = expressionLinks.map((link) => link.expression)

  const registry = new ParameterTypeRegistry()
  const docs = buildSuggestions(
    registry,
    ['I have 42 cukes in my belly', 'I have 96 cukes in my belly', 'there are 38 blind mice'],
    expressions
  )
  const index = jsSearchIndex(docs)
  return configureMonaco(monaco, index, expressions)
}
(window as any).makeConfigureEditor = makeConfigureEditor;
(window as any).monaco = monaco;
