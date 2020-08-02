# 学习笔记
## toy browser css部分
1. 在parse阶段endtag的时候计算当前tag是否符合任意css rule
2. 从当前元素一路向上匹配，来实现复合选择器
3. 根据specificty [inline, id, class, tag]计算css优先级
   
-------------------   
   
## layout部分(flex布局)
### parse数值，为元素style赋默认值
    flexDirection = row //横着排列
    alignItems = stretch //撑满交叉轴
    justifyContent = flex-start //如果子元素没指定了flex的话主轴起始的位置
    alignContent = flex-start //子元素交叉轴起始的位置
    
    重要的变量:
    mainSize = 'width';
    mainStart = 'left';
    mainEnd = 'right';
    mainSign = +1;
    mainBase = 0; //用作下一个元素在主轴的起始点
    mainSpace  //主轴剩余的空间
### 计算出每个元素应该处在哪一行， 占主轴和交叉轴的大小
    如果用了flexWrap=nowrap 那么所以子元素都要在同一行，如果空间不够等比例缩小
    
    不然的话根据元素尺寸来决定元素处在哪一行
    
### 计算当前元素的主轴位置
    justifyContent(flex-start,flex-end,center,space-between,space-around)由justifyContent的类型和各个元素的尺寸共同决定元素在主轴的位置

    如果其中有的子元素用了flex属性，那么justifyContent就按照flex-start，他们会平分主轴剩余的空间。
    
### 计算当前元素的交叉轴位置
   父元素可以通过alignContent(flex-start,flex-end,center,space-between,space-around, stretch) 来指定子元素的交叉轴位置和大小
   子元素可以通过alignSelf, alignItems来覆盖