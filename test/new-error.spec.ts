/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { join } from 'path'
import dedent from 'dedent-js'
import { Filesystem } from '@poppinss/dev-utils'

import { Loader } from '../src/Loader'
import { Compiler } from '../src/Compiler'
import { newError } from '../src/Tags'
import { Processor } from '../src/Processor'
import { Template } from '../src/Template'

import './assert-extend'

const tags = { newError }
const fs = new Filesystem(join(__dirname, 'views'))

const loader = new Loader()
loader.mount('default', fs.basePath)

test.group('New Error', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
    Template.hydrate()
  })

  test('raise an exception', async (assert) => {
    assert.plan(4)

    await fs.add(
      'foo.edge',
      dedent`
      Hello world
      @newError('This is an error')
    `
    )

    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    try {
      template.render('foo', {})
    } catch (error) {
      assert.equal(error.message, 'This is an error')
      assert.equal(error.filename, join(fs.basePath, 'foo.edge'))
      assert.equal(error.line, 2)
      assert.equal(error.col, 10)
    }
  })

  test('raise an exception from a member expression', async (assert) => {
    assert.plan(4)

    await fs.add(
      'foo.edge',
      dedent`
      Hello world
      @newError(errorMessages.message)
    `
    )

    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    try {
      template.render('foo', {
        errorMessages: {
          message: 'This is an error',
        },
      })
    } catch (error) {
      assert.equal(error.message, 'This is an error')
      assert.equal(error.filename, join(fs.basePath, 'foo.edge'))
      assert.equal(error.line, 2)
      assert.equal(error.col, 10)
    }
  })

  test('raise an exception with custom filename', async (assert) => {
    assert.plan(4)

    await fs.add(
      'foo.edge',
      dedent`
      Hello world
      @newError(errorMessages.message, 'foo.edge', 2, 0)
    `
    )

    const processor = new Processor()
    const compiler = new Compiler(loader, tags, processor, { cache: false })
    const template = new Template(compiler, {}, {}, processor)

    try {
      template.render('foo', {
        errorMessages: {
          message: 'This is an error',
        },
      })
    } catch (error) {
      assert.equal(error.message, 'This is an error')
      assert.equal(error.filename, 'foo.edge')
      assert.equal(error.line, 2)
      assert.equal(error.col, 0)
    }
  })
})
