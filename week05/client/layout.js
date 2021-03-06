const { stringify } = require("css")

/*
    {
        "type": "element",
        "children": null,
        "attributes": [
            {
            "name": "charset",
            "value": "utf-8"
            },
            {
            "name": "async",
            "value": ""
            },
            {
            "name": "src",
            "value": "xxxx"
            }
        ],
        "tagName": "script",
        "computedStyle": {

        },
        "parent": null
    }
*/
module.exports = function(element) {
    if (!element.computedStyle) {
        return;
    }

    const elementStyle = getStyle(element);

    if (elementStyle.display !== 'flex') {
        return;
    }

    const items = element.children.filter(e => e.type === 'element');

    items.sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
    });

    var style = elementStyle;
    // 赋默认值
    ['width', 'height'].forEach(size => {
        if (style[size] === 'auto' || style[size] === '') {
            style[size] = null;
        }
    });

    if (!style.flexDirection || style.flexDirection === 'auto') {
        style.flexDirection = 'row';
    }
    if (!style.alignItems || style.alignItems === 'auto') {
        style.alignItems = 'stretch';
    }
    if (!style.justifyContent || style.justifyContent === 'auto') {
        style.justifyContent = 'flex-start';
    }
    if (!style.alignContent || style.alignContent === 'auto') {
        style.alignContent = 'stretch';
    }

    let mainSize, mainStart, mainEnd, mainSign, mainBase,
        crossSize, crossStart, crossEnd, crossSign, crossBase;

    if (style.flexDirection === 'row') {
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom'
    }
    if (style.flexDirection === 'row-reverse') {
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom'
    }

    if (style.flexDirection === 'column') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right'
    }

    if (style.flexDirection === 'column-reverse') {
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = +1;
        mainBase = style.height;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right'
    }

    if (style.flexWrap === 'wrap-reverse') {
        let tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        crossSign = -1;
    } else {
        crossBase = 0;
        crossSign = 1;
    }

    let isAutoMainSize = false;
    if (!style[mainSize]) {
        elementStyle[mainSize] = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            let itemStyle = getStyle(item);
            if (itemStyle[mainSize] !== null && itemStyle[mainSize] !== (void 0)) {
                elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize]
            }
        }
        isAutoMainSize = true;
    }

    let flexLine = [];
    const flexLines = [flexLine];

    let mainSpace = elementStyle[mainSize];
    let crossSpace = 0;
    //计算所有子元素的主轴大小
    for (var i = 0; i < items.length; i ++) {
        const item = items[i];
        const itemStyle = getStyle(item);

        if (itemStyle[mainSize] === null) {
            itemStyle[mainSize] = 0;
        }

        if (itemStyle.flex) {
            flexLine.push(item);
        } else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
            mainSpace -= itemStyle[mainSize];
            if (itemStyle[crossSize] != null && itemStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            flexLine.push(item);
        } else {
            if (itemStyle[mainSize] > style[mainSize]) {
                itemStyle[mainSize] = style[mainSize];
            }
            if (mainSpace < itemStyle[mainSize]) {
                flexLine.mainSize = mainSize;
                flexLine.crossSize = crossSize;
                flexLine.crossSpace = crossSpace;
                flexLines.push([item]);
                mainSpace = style[mainSize];
                crossSpace = 0;
            } else {
                flexLine.push(item);
            }
            if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize])
            }
            mainSpace -= itemStyle[mainSize]
        }
    }
    flexLine.mainSpace = mainSpace;
    //计算每一行交叉轴大小,各个子元素所属的行
    if (style.flexWrap === 'nowrap' || isAutoMainSize) {
        flexLine.crossSpace = (style[crossSize] !== undefined) ? style[crossSize] : crossSpace;
    } else {
        flexLine.crossSpace = crossSpace;
    }

    if (mainSpace < 0) {
        //都挤在一行，需要等比例缩小的情况
        const scale = style[mainSize] / (style[mainSize] - mainSpace);
        let currentMain = mainBase;
        for (var i = o; i < items.length; i ++) {
            var item = items[i];
            var itemStyle = getStyle(item);

            if (itemStyle.flex) {
                itemStyle[mainSize] = 0;
            }

            itemStyle[mainSize] = itemStyle[mainSize] * scale;

            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
            currentMain = itemStyle[mainEnd];
        }
    } else {
        flexLines.forEach(function (items) {
            var mainSpace =  items.mainSpace;
            var flexTotal = 0;
            //数一下多少子元素有flex属性
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var itemStyle = getStyle(item);

                if ((itemStyle.flex !== null) && (itemStyle.flex !== (void 0))) {
                    flexTotal += itemStyle.flex;
                    continue;
                }
            }

            if (flexTotal > 0) {
                //如果有flex属性的子元素，那它们平分剩余空间
                var currentMain = mainBase;
                for (var i = 0; i < items.length; i ++) {
                    var item = items[i];
                    var itemStyle = getStyle(item);

                    if (itemStyle.flex) {
                        itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
                    }
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd];
                }
            } else {
                //根据justify content来决定各个元素在主轴的起始位置
                if (style.justifyContent === 'flex-start') {
                    var currentMain = mainBase;
                    var step = 0;
                }
                if (style.justifyContent === 'flex-end') {
                    var currentMain = mainSpace * mainSign + mainBase;
                    var step = 0;
                }
                if (style.justifyContent === 'center') {
                    var currentMain = mainSpace / 2 * mainSign + mainBase;
                    var step = 0;
                }
                if (style.justifyContent === 'space-between') {
                    var step = mainSpace / (items.length - 1) * mainSign;
                    var currentMain = mainBase;
                }
                if (style.justifyContent === 'space-around') {
                    var step = mainSpace / items.length * mainSign;
                    var currentMain = step / 2 + mainBase;
                }
                //计算出各个子元素的主轴起始位置
                for (var i = 0; i < items.length; i ++) {
                    var item = items[i];
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = item[mainEnd] + step;
                }
                
                var crossSpace;

                if (!style[crossSize]) {
                    crossSpace = 0;
                    elementStyle[crossSize] = 0;
                    for (var i = 0; i < flexLines.length; i ++) {
                        elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace;
                    }
                } else {
                    crossSpace = style[crossSize];
                    for (var i = 0; i < flexLines.length; i ++) {
                        crossSpace -= flexLines[i].crossSpace;
                    }
                }

                //计算出各个子元素交叉轴的起始位置
                if (style.flexWrap === 'wrap-reverse') {
                    crossBase = style[crossSize];
                } else {
                    crossBase = 0;
                }
                var lineSize = style[crossSize] / flexLines.length;
                //根据element的alignContent计算出各个子元素默认交叉轴起始位置
                var step;
                if (style.alignContent === 'flex-start') {
                    crossBase += 0;
                    step = 0;
                }
                if (style.alignContent === 'flex-end') {
                    crossBase += crossSign * crossSpace;
                    step = 0;
                }
                if (style.alignContent === 'center') {
                    crossBase += crossSign * crossSpace / 2;
                    step = 0;
                }
                if (style.alignContent === 'space-between') {
                    crossBase += 0;
                    step = crossSpace / (flexLines.length - 1);
                }
                if (style.alignContent === 'space-around') {
                    step = crossSpace / (flexLines.length);
                    crossBase += crossSign * step / 2;
                }
                if (style.alignContent === 'stretch') {
                    crossBase += 0;
                    step = 0;
                }
                flexLines.forEach(function(items) {
                    var lineCrossSize = style.alignContent === 'stretch' ?
                        items.crossSpace + crossSpace / flexLines.length :
                        items.crossSpace;
                    for (var i = 0; i < items.length; i ++) {
                        var item = items[i];
                        var itemStyle = getStyle(item);
                        var align = itemStyle.alignSelf || style.alignItems;
                        if (item === null) {
                            itemStyle[crossSize] = (align === 'stretch') ?
                                lineCrossSize : 0;
                        }
                        //也可以根据子元素的alignSelf和alignItems决定交叉轴起始的位置
                        if (align === 'flex-start') {
                            itemStyle[crossStart] = crossBase;
                            itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
                        }
                        if (align === 'flex-end') {
                            itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
                            itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
                        }
                        if (align === 'center') {
                            itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2;
                            itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
                        }
                        if (align === 'stretch') {
                            itemStyle[crossStart] = crossBase;
                            itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * lineCrossSize;
                            itemStyle[crossSize] = crossSign * lineCrossSize
                        }
                    }
                    crossBase += crossSign * (lineCrossSize + step);
                });
                console.log(items);
            }
        });
    }
}

function getStyle(element) {
    if (!element.style) {
        element.style = {};
    }

    for (let prop in element.computedStyle) {
        element.style[prop] = element.computedStyle[prop].value;

        if (element.style[prop].toString().match(/px$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }
        if (element.style[prop].toString().match(/^[0-9\.]+$]/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }
    }

    return element.style;
}