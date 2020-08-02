const layout = require("./layout")
const css = require("css");
const EOF = Symbol("EOF")
let currentToken = null;
let currentAttribute = null;

let stack = [{ type: "document", children: [] }];
let currentTextNode = null;

function emit(token) {
  let top = stack[stack.length - 1];

  if (token.type === "startTag") {
      let element = {
          type: "element",
          children: [],
          attributes: [],
        };
        element.tagName = token.tagName;
        for (let p in token) {
            if (p != "type" && p != "tagName") {
                element.attributes.push({
                    name: p,
                    value: token[p],
                })
            }
        } 
        computeCss(element);
        top.children.push(element);
        element.parent = top;
        if (!token.isSelfClosing) {
            stack.push(element);
        }    
        currentTextNode = null; 
    } else if ((token.type === "endTag")) {
        if ((top.tagName !== token.tagName)) {
            throw new Error("Tag start end dosen't match");
        } else {
            layout(top);
            stack.pop();
        }
        if (token.tagName === 'style') {
            addCssRules(currentTextNode.content);
        }
        
        currentTextNode = null;
    } else if (token.type === "text") {
        if (currentTextNode === null) {
            currentTextNode = {
                type: "text",
                content: "",
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}

let rules = []
function addCssRules(content) {
    const ast = css.parse(content);
    rules.push(...ast.stylesheet.rules);
}

function computeCss(element) {
    var elements = stack.slice().reverse();
    if (!element.computedStyle) {
        element.computedStyle = {};
    }
    for (rule of rules) {
        const specificity = [0, 0, 0, 0];
        const ruleParts = rule.selectors[0].split(" ").reverse();
        let matched = 0;
        for (let i = 0; i <= elements.length; i ++) {
            if (match(i === 0 ? element : elements[i - 1], ruleParts[matched], specificity)) {
                matched ++;
            }
            if (matched === ruleParts.length) {
                for (let declaration of rule.declarations) {
                    if (!element.computedStyle[declaration.property]) {
                        element.computedStyle[declaration.property] = {};
                    }
                    let canOverride = true;
                    const currentSpecificity = element.computedStyle[declaration.property].specificity;
                    if (currentSpecificity) {
                        for (let j = 0; j < specificity.length; j++) {
                            if (specificity[j] !== currentSpecificity[j]) {
                                canOverride = currentSpecificity[j] < specificity[j];
                                break;
                            }
                        }
                    }
                    if (canOverride) {
                        element.computedStyle[declaration.property].value = declaration.value;
                        element.computedStyle[declaration.property].specificity = specificity;
                    }
                }
            }
        }
    }
}

function match(element, selector, specificity) {
    if (!selector || !element.attributes) {
        return false;
    }
    if (selector.charAt(0) === "#") {
        const attr = element.attributes.filter(attr => attr.name === 'id')[0];
        if (attr && attr.value === selector.substring(1)) {
            specificity[1] += 1;
            return true
        }
    } else if (selector.charAt(0) === ".") {
        const attr = element.attributes.filter(attr => attr.name === 'class')[0];
        if (attr && attr.value === selector.substring(1)) {
            specificity[2] += 1;
            return true
        }
    } else {
        if (element.tagName === selector.substring(0)) {
            specificity[3] += 1;
            return true
        }
    }
    return false;
}

function data(c) {
    if (c === "<") {
        return tagOpen;
    } else if (c === EOF) {
        emit({type: "EOF",});
        return;
    } else {
        emit({
        type: "text",
        content: c,
        })
        return data;
    }
}

function tagOpen(c) {
    if (c === "/") {
        return endTagOpen;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
        type: "startTag",
        tagName: "",
        }
        return tagName(c);
    } else {
        return
    }
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
        type: "endTag",
        tagName: "",
        }
        return tagName(c)
    } else if (c === ">") {

    } else {

    }
}

function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === "/") {
        return selfClosingStartTag;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c;
        return tagName;
    } else if (c === ">") {
        emit(currentToken);
        return data;
    } else {
        return tagName;
    }
}

function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === "/" || c === ">" || c === EOF) {
        return afterAttributeName(c);
    } else if (c === "=") {

    } else {
        currentAttribute = {
            name: "",
            value: "",
        }
        return attributeName(c);
    }
}

function attributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || c === "/" || c === ">" || c === EOF) {
        return afterAttributeName(c);
    } else if (c === "=") {
        return beforeAttributeValue;
    } else if (c === "\u0000") {

    } else if (c === '"' || c === "'" || c === "<") {

    } else {
        currentAttribute.name += c;
        return attributeName;
    }
}

function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/) || c === "/" || c === ">" || c === EOF) {
        return beforeAttributeValue;
    } else if (c === "\"") {
        return doubleQuotedAttributeValue;
    } else if (c === "\'") {
        return singleQuotedAttributeValue;
    } else if (c === ">") {

    } else {
        return UnquotedAttributeValue(c);
    }
}

function doubleQuotedAttributeValue(c) {
    if (c === "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c === "\u0000") {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c
        return doubleQuotedAttributeValue;
    }
}

function singleQuotedAttributeValue(c) {
    if (c === "\'") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c === "\u0000") {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c
        return singleQuotedAttributeValue;
    }
}

function UnquotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if (c === "/") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    } else if (c === ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === "\u0000") {

    } else if (c === '"' || c === "'" || c === "<" || c === "=" || c === "`") {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c;
        return UnquotedAttributeValue;
    }
}

function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName;
    } else if (c === "/") {
        return selfClosingStartTag;
    } else if (c === "=") {
        return beforeAttributeValue;
    } else if (c === ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === EOF) {

    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name: "",
            value: "",
        }
        return attributeName(c);
    }
}

function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c === "/") {
    return selfClosingStartTag;
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data
  } else if (c === EOF) {
  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

function selfClosingStartTag(c) {
    if (c === ">") {
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    } else if (c === "EOF") {

    } else {

    }
}

module.exports.parseHTML = function(html) {
    let state = data;
    for (let c of html) {
        state = state(c);
    }
    state = state(EOF);
    return stack[0];
}