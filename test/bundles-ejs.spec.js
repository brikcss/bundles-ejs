/* eslint-env jest */
import bundles from '@bundles/core'
import ejs from '../lib/bundles-ejs.js'
import path from 'path'
// import log from 'loglevel'
// log.setLevel('silent')

test('Compile with simple data', () => {
  expect.assertions(3)
  return bundles.run({
    bundles: [{
      id: 'test1',
      input: ['test/fixtures/simple.md'],
      bundlers: [ejs]
    }],
    data: {
      name: 'Jonny',
      age: '16'
    }
  }).then(result => {
    expect(result.bundles.length).toBe(1)
    expect(result.bundles[0].output.size).toBe(1)
    expect(result.bundles[0].output.get('test/fixtures/simple.md')).toMatchObject({
      data: {
        name: 'Jonny',
        age: '16'
      },
      content: '# Jonny\'s story\n\nThis is a story about Jonny. Jonny is 16 years old.\n\nTHE END.\n'
    })
  })
})

test('Compile with front matter and partials include', () => {
  expect.assertions(4)
  return bundles.run({
    id: 'test3',
    input: ['test/fixtures/complex.md'],
    data: (file) => {
      return {
        source: file.source.path,
        name: path.basename(file.source.path)
      }
    },
    bundlers: [ejs]
  }).then(result => {
    expect(result.bundles.length).toBe(1)
    expect(result.bundles[0]).toMatchObject({
      success: true,
      id: 'test3'
    })
    expect(result.bundles[0].output.size).toBe(1)
    expect(result.bundles[0].output.get('test/fixtures/complex.md')).toMatchObject({
      data: {
        testing: 123,
        source: 'test/fixtures/complex.md',
        name: 'complex.md'
      },
      content: '# Complex Data\n\n## File Metadata\n\n- SOURCE: test/fixtures/complex.md\n- NAME: complex.md\n\n## Other data\n\nThe variable: 123. I want to include a message:\n\n> Hi, complex.md. I am not from around here.\n\n'
    })
  })
})

test('Compile with options.localsName and options._with', () => {
  expect.assertions(4)
  return bundles.run({
    bundles: [{
      id: 'locals',
      input: {
        path: 'locals.md',
        content: '# I am <%= props.name %>.'
      },
      bundlers: [{ run: ejs, options: { _with: true, localsName: 'props' } }]
    }],
    data: {
      name: 'Jonny'
    }
  }).then(result => {
    expect(result.bundles.length).toBe(1)
    expect(result.bundles[0]).toMatchObject({
      success: true,
      id: 'locals'
    })
    expect(result.bundles[0].output.size).toBe(1)
    expect(result.bundles[0].output.get('locals.md')).toMatchObject({
      data: {
        name: 'Jonny'
      },
      content: '# I am Jonny.'
    })
  })
})
