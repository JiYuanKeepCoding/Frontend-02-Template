# 学习笔记
## 乔拇斯谱系4种产生式
1. 无限制 `?::=?`
2. 上下文相关 `?<A>?::=?<B>?`
3. 上下文无关 `?<A>::=?`
4. 正则文法 `<A> ::=<A>?`
   
-------------------   
   
## 四则运算的例子
```
   <MutiplicativeExpression>::=<Number>|
	<MultiplicativeExpression>"*"<Number>|
	<MultiplicativeExpression>"/"<Number>|
	(<MultiplicativeExpression>)|

    <AdditiveExpression>::=<MultiplicativeExpression>|
     <AdditiveExpression>"+"</AdditiveExpression>|
     <AdditiveExpression>"-"<MultiplicativeExpression>|
     (<AdditiveExpression>)|
```

## 命令式编程语言
1. Atom (Identifier, Literal)
2. Expression(Atom, Operator, Puctuator(标点符号))
3. Statement(Expression, Keyword, Puctuator)
4. Structure(Function, class, namespace)
5. Program(Module, Package, Library)


## JS类型
1. IEEE 754 Double Float
2. unicode字符集和utf-8编码(./utf8.js)
   