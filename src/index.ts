import { App, MoveEvent, ZoomEvent } from '@leafer-ui/core'
import type { ILeaf } from '@leafer-ui/interface'
import {
  EditorEvent,
  EditorMoveEvent,
  EditorRotateEvent,
  EditorScaleEvent,
} from '@leafer-in/editor'

export const PLUGIN_NAME = 'leafer-x-edit-toolbar'

/**
 * 用户配置
 */
export type IConfig = {
  /**
   * 自定义容器类名
   */
  className?: string
  /**
   * 自定义容器，建议与 leafer 渲染点在同一层级
   */
  container?: HTMLDivElement
  /**
   * 是否跟随缩放
   */
  followScale?: boolean
  /**
   * 是否显示 toolbar
   */
  shouldShow?: (node: ILeaf) => boolean
  /**
   * 渲染 toolbar 内容
   */
  onRender: (node: ILeaf, container: HTMLDivElement) => void
}

export class EditToolbarPlugin {
  /**
   * @param { App } app - leafer app 实例
   * @private
   */
  private readonly app: App

  /**
   * @param { HTMLDivElement } container - toolbar DOM 容器
   * @private
   */
  private container: HTMLDivElement

  /**
   * @param { IConfig } config - 用户配置
   * @private
   */
  private readonly config: IConfig

  constructor(app: App, config: IConfig) {
    this.app = app
    this.config = config

    this.toolbarHandler = this.toolbarHandler.bind(this)

    this.initEvent()
  }

  /**
   * 初始化事件
   */
  private initEvent() {
    // 监听画布选择事件
    this.app.on([MoveEvent.MOVE, ZoomEvent.ZOOM], this.toolbarHandler)
    this.app.editor.on(
      [
        EditorEvent.SELECT,
        EditorMoveEvent.MOVE,
        EditorScaleEvent.SCALE,
        EditorRotateEvent.ROTATE,
      ],
      this.toolbarHandler
    )
  }

  /**
   * 选中事件处理
   */
  private async toolbarHandler() {
    await Promise.resolve()
    const { editor } = this.app
    const node = editor.element
    // 提前判断，避免后面额外计算
    if (!node) {
      this.hideToolbar()
      return
    }
    // 判断是否允许显示
    const isShouldShow = this.config.shouldShow
      ? this.config.shouldShow(node)
      : true
    // 不允许显示
    if (!isShouldShow) {
      this.hideToolbar()
      return
    }
    this.showToolbar(node)
  }

  /**
   * 显示 toolbar
   */
  private showToolbar(node: ILeaf) {
    if (!this.container) {
      if (this.config.container) {
        this.container = this.config.container
      } else {
        this.container = document.createElement('div')
        document.body.appendChild(this.container)
      }
      this.container.classList.add(PLUGIN_NAME)
      if (this.config.className) {
        this.container.classList.add(this.config.className)
      }
      addStyle(this.container, {
        pointerEvents: 'auto',
        position: 'absolute',
        whiteSpace: 'nowrap',
      })
    }
    this.config.onRender(node, this.container)
    const style: Partial<CSSStyleDeclaration> = {
      display: 'block',
      left: `${node.worldBoxBounds.x}px`,
      top: `${node.worldBoxBounds.y}px`,
    }
    if (this.config.followScale) {
      style.transformOrigin = 'left top'
      style.transform = `scale(${Math.abs(
        node.worldTransform.scaleX
      )}, ${Math.abs(node.worldTransform.scaleY)}) translate(0, -100%)`
    } else {
      style.transform = 'translate(0, -100%)'
    }
    addStyle(this.container, style)
  }

  /**
   * 隐藏 toolbar
   */
  private hideToolbar() {
    if (this.container) {
      addStyle(this.container, {
        display: 'none',
      })
    }
  }

  /**
   * 销毁 toolbar
   */
  public destroy() {
    // 移除事件
    this.app.off([MoveEvent.MOVE, ZoomEvent.ZOOM], this.toolbarHandler)
    this.app.editor.off(
      [
        EditorEvent.SELECT,
        EditorMoveEvent.MOVE,
        EditorScaleEvent.SCALE,
        EditorRotateEvent.ROTATE,
      ],
      this.toolbarHandler
    )
    // 移除 toolbar
    if (this.container && this.container.parentNode && !this.config.container) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}

/**
 * 使用 requestAnimationFrame 来防止多次重绘和回流
 *
 * @param {HTMLElement} element 要添加样式的DOM元素
 * @param {Partial<CSSStyleDeclaration>} cssStyles 包含键值对形式样式规则的对象
 */
function addStyle(
  element: HTMLElement,
  cssStyles: Partial<CSSStyleDeclaration>
) {
  requestAnimationFrame(() => {
    Object.entries(cssStyles).forEach(([property, value]) => {
      // 确保属性名使用的是camelCase
      ;(element.style as any)[property] = value
    })
  })
}
