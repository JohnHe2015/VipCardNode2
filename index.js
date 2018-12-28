const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dbconfig = require('./config/mysql.config.js');
const Sequelize = require('sequelize');
const userRouter = require('./router/user');
const couponRouter = require('./router/coupon');

const app = express();
app.listen(8081);

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


app.use(express.static('./public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/user',userRouter);
app.use('/coupon',couponRouter);
// app.use('/wx',wxRouter);