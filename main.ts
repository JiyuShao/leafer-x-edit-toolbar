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

new EditToolbarPlugin(app, {
  className: 'edit-toolbar',
  followScale: true,
  shouldShow: (node) => {
    console.log('node', node)
    return true
  },
  onRender(_node, container) {
    container.innerHTML = `
      <style>
        .toolbar {
          display: flex;
          align-items: center;
          height: 40px;
          margin: 10px 0;
          background-color: #fff;
          border-radius: 5px;
          border: 1px solid #ccc;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .divider {
          width: 1px;
          height: 100%;
          background: #ccc;
        }
        .item {
          display: flex;
          align-items: center;
          height: 100%;
          padding: 0 10px;
        }
        .item:hover {
          background: rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }
      </style>
      <div class="toolbar">
        <div class="item"><span>ADD</span></div>
        <div class="divider"></div>
        <div class="item"><span>REMOVE</span></div>
      </div>
    `
  },
})

app.editor.select([group])
