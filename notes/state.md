# state
React 认为一个 UI 是 数据+模版 渲染出来的

### state 只存放数据，本身是一个js对象
1. 数据来源
2. 数据更新机制
```js
// 利用js的上下文读取 state
class MyComponent extends Component{
    constructor(){
        super();
        this.state = {
            a: 1,
            b: 1
        }
    }
    render(){
        return <div>
            <h1>my Component</h1>
            <span>{this.state.a.toString()}</span>
            {this.children}
        </div>
    }
}
```


### setState
1. 改变 ```state``` 合并新旧 ```state```
2. 在多次 ```setState``` 后调用 ```render``` 函数重新渲染


### 状态改造
#### 使用 Range对象 改造toy-react

使用 ```Range对象``` 来创建片段，可以方便存储，和重新渲染
```js
const RENDER_TO_DOM = Symbol("render to dom")

// jsx 实现的主体
class ElementWrapper {
    constructor(type){
        this.root = document.createElement(type); // 实体dom
    }
    setAttribute(name, value){
        this.root.setAttribute(name,value);
    }
    appendChild(component){
        let range = document.createRange(); // 创建一段包含节点与文本节点的一部分的文档片段
        range.setStart(this.root, this.root.childNodes.length);
        range.setEnd(this.root, this.root.childNodes.length); // childNodes 属性返回节点的子节点集合，以 NodeList 对象。
        // range.deleteContents(); // 从文档中移除 Range 包含的内容。
        component[RENDER_TO_DOM](range);

    }
    [RENDER_TO_DOM](range){ // 方括号表示变量
        range.deleteContents(); // 先删除内容
        range.insertNode(this.root); // 在 Range 的起点处插入一个节点。
    }
}

class TextWrapper {
    constructor(content){
        this.root = document.createTextNode(content); // 实体dom
    }
    // 文本节点没有属性,没有孩子节点
    [RENDER_TO_DOM](range){ // 方括号表示变量
        range.deleteContents(); // 先删除内容
        range.insertNode(this.root);
    }
}

export class Component {
    constructor(){
        this.props = Object.create(null); // 创建一个绝对空的对象给props
        this.children = [];
        this._root = null; // 私有root
    }
    setAttribute(name, value){
        this.props[name] = value;
        // console.log(this.props)
    }
    appendChild(component){
        this.children.push(component)
    }
    // 封装一个私有函数去重新render,range代表重新渲染范围
    [RENDER_TO_DOM](range){ // 方括号表示变量
        this.render()[RENDER_TO_DOM](range);
    }
}

export function createElement(type, attributes, ...children){
    let e;
    if(typeof type === "string"){
        // 处理原生标签
        e = new ElementWrapper(type);
    }else{
        // 处理自定义组件
        e = new type;
    }
    for(let p in attributes){
        e.setAttribute(p, attributes[p])
    }
    let insertChildren = (children) =>{
        for(let child of children){
            if(typeof child === 'string'){
                child = new TextWrapper(child);
            }
            if(typeof child === "object" && child instanceof Array) {
                insertChildren(child);
            } else {
                e.appendChild(child);
            }
        }
    }
    insertChildren(children)
    return e;
}

export function render(component, parentElement){
    let range = document.createRange(); // 创建一段包含节点与文本节点的一部分的文档片段
    range.setStart(parentElement, 0);
    range.setEnd(parentElement, parentElement.childNodes.length); // childNodes 属性返回节点的子节点集合，以 NodeList 对象。
    range.deleteContents(); // 从文档中移除 Range 包含的内容。
    component[RENDER_TO_DOM](range);
}
```

#### 存储 Range对象，编写重新绘制函数
使用组件的私有变量来存储 Range
``` js
export class Component {
    constructor(){
        this.props = Object.create(null); // 创建一个绝对空的对象给props
        this.children = [];
        this._root = null; // 私有root
        this._range = null; // 存储range
    }
    setAttribute(name, value){
        this.props[name] = value;
        // console.log(this.props)
    }
    appendChild(component){
        this.children.push(component)
    }
    // 封装一个私有函数去重新render,range代表重新渲染范围
    [RENDER_TO_DOM](range){ // 方括号表示变量
        this._range = range;
        this.render()[RENDER_TO_DOM](range);
    }
    rerender(){ // 重新绘制指令
        let oldRange = this._range;

        let range = document.createRange();
        range.setStart(oldRange.startContainer, oldRange.startOffset);
        range.setEnd(oldRange.startContainer, oldRange.startOffset);
        this[RENDER_TO_DOM](range);

        oldRange.setStart(range.endContainer, range.endOffset);
        oldRange.deleteContents();
    }
}
```

#### 编写 setState 函数
```js
export class Component {
    constructor(){
        this.props = Object.create(null); // 创建一个绝对空的对象给props
        this.children = [];
        this._root = null; // 私有root
        this._range = null; // 存储range
    }
    setAttribute(name, value){
        this.props[name] = value;
        // console.log(this.props)
    }
    appendChild(component){
        this.children.push(component)
    }
    // 封装一个私有函数去重新render,range代表重新渲染范围
    [RENDER_TO_DOM](range){ // 方括号表示变量
        this._range = range;
        this.render()[RENDER_TO_DOM](range);
    }
    rerender(){ // 重新绘制指令
        let oldRange = this._range;

        let range = document.createRange();
        range.setStart(oldRange.startContainer, oldRange.startOffset);
        range.setEnd(oldRange.startContainer, oldRange.startOffset);
        this[RENDER_TO_DOM](range);

        oldRange.setStart(range.endContainer, range.endOffset);
        oldRange.deleteContents();
    }
    setState(newState){ // 递归调用merge，最后rerender
        if(this.state === null || typeof this.state !=="object") { // 基本类型直接替换
            this.state = newState;
            this.rerender();
            return;
        }
        let merge = (oldState, newState) => {
            for(let p in newState) {
                if(oldState[p] === null || typeof oldState[p] !== "object") {
                    oldState[p] = newState[p]
                } else {
                    merge(oldState[p], newState[p]);
                }
            }
        }
        merge(this.state, newState);
        this.rerender();
    }
}
```
setState 的调用方式
```js
// jsx
<button onclick={()=>{ this.setState({a: this.state.a + 1})}}>add</button>
```
