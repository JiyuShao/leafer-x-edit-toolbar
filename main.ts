import { App, Rect, Group } from 'leafer-ui'
import { Editor } from '@leafer-in/editor'

import { EditToolbarPlugin } from './src'

const app = new App({ view: window })

app.tree = app.addLeafer()
app.sky = app.addLeafer({ type: 'draw', usePartRender: false })

app.editor = new Editor()

app.sky.add(app.editor)

const group = new Group({
  // hitChildren: false,
  x: 100,
  y: 100,
  width: 100,
  height: 100,
})

app.tree.add(group)

group.add(
  Rect.one(
    { editable: true, fill: 'green', cornerRadius: [20, 0, 0, 20] },
    0,
    0
  )
)
group.add(
  Rect.one(
    { editable: true, fill: 'red', cornerRadius: [0, 20, 20, 0] },
    200,
    0
  )
)

// eslint-disable-next-line no-new
new EditToolbarPlugin(app, {
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

app.editor.select([group])
