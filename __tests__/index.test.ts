import { beforeEach, describe, expect, test } from 'vitest'
import { JSDOM } from 'jsdom'
import { Editor } from '@leafer-in/editor'
import { Rect } from '@leafer-ui/core'
import { App } from '@leafer-ui/core'
import { EditToolbarPlugin, PLUGIN_NAME } from '../src'

describe('EditToolbarPlugin with scale', () => {
  let app: App
  let editToolbarPlugin: EditToolbarPlugin

  beforeEach(() => {
    const jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
      url: 'http://localhost', // 设置一个合法的URL
    })

    global.document = jsdom.window.document
    global.localStorage = jsdom.window.localStorage
    global.sessionStorage = jsdom.window.sessionStorage
    global.HTMLStyleElement = jsdom.window.HTMLStyleElement
    global.HTMLElement = jsdom.window.HTMLElement

    app = new App({ view: jsdom.window })

    app.tree = app.addLeafer()
    app.sky = app.addLeafer({ type: 'draw', usePartRender: false })

    app.editor = new Editor()

    app.sky.add(app.editor)
    app.tree.add(
      Rect.one(
        { editable: true, fill: 'green', cornerRadius: [20, 0, 0, 20] },
        0,
        0
      )
    )
    editToolbarPlugin = new EditToolbarPlugin(app, {
      className: 'edit-toolbar',
      followScale: true,
      shouldShow: (node) => {
        console.log('node', node)
        return true
      },
      getContent(node) {
        const dom = `<ul style="list-style: none; margin: 10px 0; padding: 5px; background-color: #fff; border-radius: 5px; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <li>节点类型：${node.tag}</li>
            <li>宽度：${node.width}</li>
            <li>高度：${node.height}</li>
          </ul>
          `
        return dom
      },
    })
  })

  test('Select element should show dom', () => {
    app.editor.select(app.tree.children[0])
    expect(document.querySelector(`.${PLUGIN_NAME}`)).not.toBe(null)
  })

  test('destroy', () => {
    editToolbarPlugin.destroy()
    expect(
      document.querySelector(`.${PLUGIN_NAME}`)
    ).toBe(null)
  })
})
