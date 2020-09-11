// jsx 实现的主体
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