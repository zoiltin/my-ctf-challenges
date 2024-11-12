# sql inject
/update路由有sql注入，单引号被转义，但反斜杠不会。用`\'`注入。

题目需要通过udf rce。插件目录设置在`/home/ctf/lib/plugins`，但是这个目录不存在。
# Path Traversal
clean path时会自动将连续的`/`合并，如果以`[A-Z]:/`开头会认为是windows路径将`\`转换为`/`，但是这个转换过程发生在合并`/`之后。

python的`os.path.realpath`函数不会自动合并连续`/`，所以`/asd///../../ -> /asd/`。

payload:
```
C:/\\\/../../../../../home/ctf/lib
C:/\\\/../../../../../home/ctf/lib/plugins
```
# raise error
/dump路由无论运行成功或报错都会删除用户创建的目录，但是底层报错(如段错误，内存不足等)会直接结束进程，目录就会保留(类似于 php通过内存报错保留临时文件)。

使用了`ujson==5.0.0`序列化json对象，ujson是基于ctypes的python库，使用了c语言加强性能。

ujson在5.0.0版本如果键名是错误unicode字符会导致段错误。https://github.com/ultrajson/ultrajson/issues/537

dump时会对username进行unicode解码，并作为键名序列化。

tip: python进程终止时，supervisord会自动重启，可能需要几秒钟的时间。

利用过程：
* 插入用户`asd\uddddasd`
* dump用户时报错创建目录
* 写入udf.so并创建函数