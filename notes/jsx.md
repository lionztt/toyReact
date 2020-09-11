# JSX
## jsx 其实是createElement函数

一段简单jsx对应的js翻译
```js
//jsx
window.a = <div id="a" class="c">
    <div>abc</div>
    <div></div>
    <div></div>
</div>

// js
window.a = createElement("div", {
  id: "a",
  "class": "c"
}, createElement("div", null, "abc"), createElement("div", null), createElement("div", null));

```

简单实现createElement函数
```js
function createElement(tagName, attributes, ...children){
    let e =  document.createElement(tagName);
    for(let p in attributes){
        e.setAttribute(p, attributes[p])
    }
    for(let child of children){
        if(typeof child === 'string'){
            child = document.createTextNode(child)
        }
        e.appendChild(child)
    }
    return e;
}
```

### 包含jsx组件写法的jsx
React中组件的写法：如果标签名全部小写为原生标签，否则为React组件，此时，会翻译为一个class
```js
// jsx
let a = <MyComponent id="a" class="c">
    <div>abc</div>
    <div></div>
    <div></div>
</MyComponent>

//js
var a = createElement(MyComponent, {
  id: "a",
  "class": "c"
}, createElement("div", null, "abc"), createElement("div", null), createElement("div", null));

```

### 第一版改造 createElement 函数
一定会报错，因为自定义组件是个class无法append 
```js
function createElement(type, attributes, ...children){
    let e;
    if(typeof type === "string"){
        // 处理原生标签
        document.createElement(type);
    }else{
        // 处理自定义组件
        e = new type;
    }
    for(let p in attributes){
        e.setAttribute(p, attributes[p])
    }
    for(let child of children){
        if(typeof child === 'string'){
            child = document.createTextNode(child)
        }
        e.appendChild(child)
    }
    return e;
}
```

### 第二版改造
做了两件事
1. 抽离createElement逻辑
2. 使用 ```ElementWrapper``` 和 ```TextWrapper``` 来实现不同节点的创建

```js
// toyReact.js
class ElementWrapper {
    constructor(type){
        this.root = document.createElement(type); // 实体dom
    }
    setAttribute(name, value){
        this.root.setAttribute(name,value)
    }
    appendChild(component){
        this.root.appendChild(component.root) // 添加实体dom
    }
}

class TextWrapper {
    constructor(content){
        this.root = document.createTextNode(content); // 实体dom
    }
    // 文本节点没有属性,没有孩子节点
}

export class Component {
    constructor(){
        this.props = Object.create(null); // 创建一个绝对空的对象给props
        this.children = [];
        this._root = null; // 私有root
    }
    setAttribute(name, value){
        this.props[name] = value;
    }
    appendChild(component){
        this.children.push(component)
    }
    get root(){ // 产生一个getter
        if(!this._root) {
            this._root = this.render().root; // 可能会发生递归，直到最终节点为elementWrapper或者textWrapper
        }
        return this._root
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
    parentElement.appendChild(component.root)
}
```
在 main.js 中引入 toyReact.js
```js
import {createElement, Component, render} from './toy-react'

class MyComponent extends Component{
    render(){
        return <div>
            <h1>my Component</h1>
            {this.children}
        </div>
    }
}

render(<MyComponent id="a" class="c">
    <div>abc</div>
    <div></div>
    <div></div>
</MyComponent>, document.body);

```
整个的封装参考了现在的React.js，具体代码可以在 [这里](https://codepen.io/gaearon/pen/gWWZgR) 找到
