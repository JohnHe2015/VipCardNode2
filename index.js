const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dbconfig = require('./config/mysql.config.js');
const Sequelize = require('sequelize');
const userRouter = require('./router/user');
const couponRouter = require('./router/coupon');
const wxRouter = require('./router/wx');
const loginRouter = require('./router/login');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
//app.listen(8081);

//websocket logic  (listening scan QR Code action)
let _socket;
io.on('connection', (socket)=>{
    console.log('one connected');
    if(socket)
    {
        _socket = socket;
    }
});



//listen http
http.listen(8081, function(){
    console.log('listening on *:8081');
});

//定义数据库连接
const sequelize = new Sequelize(dbconfig.mysql.database, dbconfig.mysql.user, dbconfig.mysql.password, {
    host: dbconfig.mysql.host,
    dialect: 'mysql',
    operatorsAliases: false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
});

//载入model实体
const User =  sequelize.import('./model/user_model.js');
const Usertemp =  sequelize.import('./model/usertemp_model.js');
const Coupon =  sequelize.import('./model/coupon_model.js');

//开发所有请求全通过，后期加白名单
app.all('*',(req,res,next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    if(!req.sequelize)
    {
        if(_socket)
        {
            req._socket = _socket;
        }
        req.sequelize = sequelize;     //挂载sequelize对象
        req.Op = sequelize.Op;
        req.User_Model = User;         //mount model objs
        req.Usertemp_Model = Usertemp;
        req.Coupon_Model = Coupon; 
    }
    if (req.method == 'OPTIONS') {
        res.send(200);
      } else {
        next();
      }
});


app.use(express.static('./'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//定义全局函数，ejs中调用
app.locals.utils = require('./common/common');   

//定义ejs模板和路径
app.set('view engine','ejs');
app.set('views',__dirname + '/ejs');

//载入路由
app.use('/user',userRouter);
app.use('/coupon',couponRouter);
app.use('/wx',wxRouter);
app.use('/login',loginRouter);
//new test git 2021/12/26