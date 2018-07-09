const http = require("http")
const fs = require("fs")
const querystring = require("querystring")
const path = require("path")
// 实例化第三方包的方法
const util = require('util');
const multiparty = require('multiparty');
const format = require('date-format');

const server = http.createServer()
server.on("request", (req, res) => {
    // 若是路径中没有且没做判断,浏览器会一直转
    // 如果访问的路径中有index,把该文件路径读取出来然后传过去
    if (req.url.includes("index")) {
        // path.join 路径拼接
        let filePath = path.join(__dirname, "index.html")
        // 读取文件的内容,同步读取,参数是文件的路径()
        let html = fs.readFileSync(filePath)
        // 先设置响应头,用来告诉浏览器该用什么格式解析
        res.setHeader("content-type", "text/html;charset=utf-8")
        // 将内容放到响应体里
        res.end(html)
    }
    // 若是路径中有login...
    else if (req.url.includes("postLogin")) {
        // 定义了一个body变量，用于暂存请求体的信息
        let body = ""
        // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到body变量中
        req.on("data", chunk => {
            body += chunk
        })
        // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
        req.on("end", () => {
            const params = querystring.parse(body)
        })
        const result = {
            status: 0,
            message: "登录成功"
        }
        res.setHeader("Content-Type", "application/json;charset=utf-8")
        res.end(JSON.stringify(result))
    }
    // 若是有上传文件的页面
    else if (req.url.includes("uploadPage.html")) {
        // 获取它在本地的路径
        let filePath = path.join(__dirname, "uploadPage.html")
        // 读取文件内容
        let html = fs.readFileSync(filePath)
        res.setHeader("content-type", "text/html;charset-utf-8")
        res.end(html)
    }
    // 若是上传文件  enctype="multipart/form-data" metho='post'
    else if (req.url.includes("upload")) {
        // 对浏览器传过来的数据进行处理
        // 先判断本地有没有 "upload"的文件夹,通过路径判断
        let dirPath = path.join(__dirname, "upload");
        // 通过fs.exists判断是否有
        let exists = fs.existsSync(dirPath)
        // 如果没有,就创建一个
        if (!exists) {
            const err = fs.mkdirSync(dirPath)
            // 没有创建成功的话
            if (err) {
                console.log(err);
            }
            console.log("mkdir ojbk");
        }
        // 创建表单对象,获取上传的文件需要第三方包 npm i multiparty -S
        const form = new multiparty.Form({
            // 存放上传文件的路径
            uploadDir: dirPath
        });
        // 
        form.parse(req, function(err, fields, files) {
            // fields  username password
            //console.log(fields)

            //获取文本域的内容
            Object.keys(fields).forEach(function(name) {
                console.log(`${name} is ${fields[name][0]}`)
            });

            //files file1 file2
            // 获取文件中的信息
            Object.keys(files).forEach(function(name) {
                console.log(name)
                const file = files[name][0]

                //旧的路径
                const oldPath = file.path

                //新的路径 201807091459232
                const newFilePath = path.join(__dirname,"upload",`${format('yyyyMMddhhmmssSSS', new Date())}.txt`)

                // 调用数据库操作的方法，把newFilePath更新到数据库的某个表的某个记录中

                const err = fs.renameSync(oldPath,newFilePath)
                if(err){
                    console.log(err)
                }

                console.log('rename OK')
            });

            //响应
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            res.end(util.inspect({fields: fields, files: files}));
        });
    }
})
// 启动服务
server.listen(80, "127.0.0.1", err => {
    if (err) {
        console.log(err)
    }
    console.log("start ok")
})