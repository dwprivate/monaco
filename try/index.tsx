import { ExpressionFactory, ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import { buildStepDocuments, jsSearchIndex } from '@cucumber/language-service'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import React, { useCallback, useLayoutEffect, useState } from 'react'
import { render } from 'react-dom'

import { configureMonaco, MonacoEditor } from '../src/index.js'

console.log('Booting')

// Build some sample step texts and cucumber expressions. These would typically come from a stream
// of Cucumber Messages.
const ef = new ExpressionFactory(new ParameterTypeRegistry())
const expressions = [
  ef.createExpression('I have {int} cukes in my belly'),
  ef.createExpression('there are {int} blind mice'),
]
const docs = buildStepDocuments(
  ['I have 42 cukes in my belly', 'I have 96 cukes in my belly', 'there are 38 blind mice'],
  expressions
)
const index = jsSearchIndex(docs)
const configureEditor = configureMonaco(monaco, index, expressions)

const value = `@foo
Feature: Hello
Scenario: Hi
  Given I have 58 cukes in my belly
  And this is an undefined step
    | some | poorly |
    | formatted | table |
`

const options = {
  value,
  language: 'gherkin',
  theme: 'vs-dark',
  // semantic tokens provider is disabled by default
  'semanticHighlighting.enabled': true,
}

// @ts-ignore
const editor1 = monaco.editor.create(document.getElementById('editor1'), options)
configureEditor(editor1)

render(
  <MonacoEditor options={options} className="editor" configure={configureEditor} />,
  document.getElementById('editor2')
)
