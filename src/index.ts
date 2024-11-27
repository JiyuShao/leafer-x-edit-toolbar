import { Leafer, MoveEvent, ZoomEvent } from '@leafer-ui/core'
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
   * 自定义容器类
   */
  className?: string
  /**
   * 是否跟随缩放
   */
  followScale?: boolean
  /**
   * 是否显示 toolbar
   */
  shouldShow?: (node: ILeaf) => boolean
  /**
   * 获取 toolbar 内容
   */
  getContent: (node: ILeaf) => string
}

export class EditToolbarPlugin {
  /**
   * @param { Leafer } app - leafer 实例
   * @private
   */
  private readonly app: Leafer

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

  constructor(app: Leafer, config: IConfig) {
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
      this.container = document.createElement('div')
      this.container.classList.add(PLUGIN_NAME)
      if (this.config.className) {
        this.container.classList.add(this.config.className)
      }
      addStyle(this.container, {
        position: 'absolute',
      })
      document.body.appendChild(this.container)
    }
    this.container.innerHTML = this.getToolbarContent(node)
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

  private getToolbarContent(node: ILeaf) {
    const argumentType = typeof this.config.getContent
    assert(
      argumentType !== 'function',
      `getContent 为必传参数，且必须是一个函数，当前为：${argumentType} 类型`
    )
    const content = this.config.getContent(node)
    assert(!content, 'getContent 返回值不能为空')
    return content
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
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}

/**
 * 异常抛出函数
 * @param condition
 * @param msg
 */
function assert(condition: boolean, msg: string) {
  if (condition) {
    throw new Error(`[${PLUGIN_NAME}]: ${msg}`)
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
