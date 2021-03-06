const express = require('express');
const router = express.Router();
const common = require('./../common/common');
const request = require('request');
const moment = require('moment');

router.get('/get',(req,res,next)=>{
    let {username,mobile,birthday,sex,level,page,pageSize} = req.query;
    let offset = (parseInt(page)-1) * parseInt(pageSize);  //偏移量
    let limit = parseInt(pageSize);                        //一页显示条数
    let whereParams = {};
    if(username) whereParams.username = {[req.Op.like]: `%${username}%`};
    if(mobile) whereParams.mobile = {[req.Op.like]: `%${mobile}%`};
    if(birthday) whereParams.birthday = birthday;
    if(sex) whereParams.sex = sex;
    if(level) whereParams.level = level;
    req.User_Model.findAndCountAll({
        where : whereParams, 
        raw:true,
        offset: offset,
        limit: limit
    }).then(data =>{
        res.end(JSON.stringify({errcode : "0", errmsg : "success",result : data.rows, count : data.count}));
    }).catch(err =>{
        res.end(JSON.stringify({errcode : "400", errmsg : err}));
    })
});


router.post('/post',(req,res,next)=>{
    let {id,username,password,mobile,birthday,sex,level} = req.body;
    req.User_Model.create({
        id : id,
        username : username,
        password : password,
        mobile : mobile,
        birthday : birthday,
        sex : sex,
        level : level,
        createTime : common.getTime()
    }).then(data =>{
        res.end(JSON.stringify({errcode : "0", errmsg : "恭喜您，用户已审核通过！"}));
    }).catch(err =>{
        res.end(JSON.stringify({errcode : "400", errmsg : err}));
    })
});

router.post('/posttemp',(req,res,next)=>{
    let {id,username,password,mobile,birthday,sex} = req.body;
    req.Usertemp_Model.create({
        id : id,          //get openid from wx
        username : username,
        password : common.md5(password),
        mobile : mobile,
        birthday : birthday,
        sex : sex,
        level : 1,
        createTime : common.getTime()
    }).then(data =>{
        res.end(JSON.stringify({errcode : "0", errmsg : "注册成功，请等待顾问审核"}));
    }).catch(err =>{
        res.end(JSON.stringify({errcode : "400", errmsg : err}));
    })
});

router.get('/gettemp',(req,res,next)=>{
    let {username,mobile,birthday,sex,level} = req.query;
    let whereParams = {};
    if(username) whereParams.username = {[req.Op.like]: `%${username}%`};
    if(mobile) whereParams.mobile = {[req.Op.like]: `%${mobile}%`};
    if(birthday) whereParams.birthday = birthday;
    if(sex) whereParams.sex = sex;
    if(level) whereParams.level = level;
    req.Usertemp_Model.findAll({
        where : whereParams, 
        raw:true,
        //offset:0,    //分页暂时先写死
        //limit:2
    }).then(data =>{
        res.end(JSON.stringify({errcode : "0", errmsg : "success",result : data}));
    }).catch(err =>{
        res.end(JSON.stringify({errcode : "400", errmsg : err}));
    })
});

router.post('/deltemp',(req,res,next)=>{
    let {id} = req.body;
    req.Usertemp_Model.destroy({
        where : {
            id : {[req.Op.eq] : id}
        }
    }).then(data =>{
        res.end(JSON.stringify({errcode : "0", errmsg : "删除成功！"}));
    }).catch(err =>{
        res.end(JSON.stringify({errcode : "400", errmsg : err}));
    })
});

router.get('/getCount',(req,res,next)=>{
    let {timestamp,type} = req.query;
    let sql = '';
    if(type == 'day')
    {
        sql = `SELECT COUNT(*) as count FROM user_table WHERE FROM_UNIXTIME(createTime/1000,"%Y-%m-%d") =:timestamp`;
    }
    else if(type == "week")
    {
        let beforeWeek = moment().subtract(7, 'days').format('YYYY-MM-DD');
        console.log(beforeWeek);
        sql = `SELECT COUNT(*) as count FROM user_table WHERE FROM_UNIXTIME(createTime/1000,"%Y-%m-%d") BETWEEN '${beforeWeek}' AND :timestamp `;
    }
    else if(type == "month")
    {
        let beforeMonth = moment().subtract(1, 'M').format('YYYY-MM-DD');
        console.log(beforeMonth);
        sql = `SELECT COUNT(*) as count FROM user_table WHERE FROM_UNIXTIME(createTime/1000,"%Y-%m-%d") BETWEEN '${beforeMonth}' AND :timestamp `;
    }
    req.sequelize.query(sql,
    { replacements: {timestamp : timestamp},type : req.sequelize.QueryTypes.SELECT})
    .then(result =>{
        res.send(JSON.stringify({errcode:"0",errmsg:"",result:JSON.stringify(result)}));
    })
})


router.get('/register',(req,res,next)=>{
    console.log('come in register');
    console.log(JSON.stringify(req.query));
    let id = req.query.openid;
    request.get({
        url : `http://api.zhengshuqian.com/login/isLogin?id=${id}`
    },function(error, response, body){
        if(response.statusCode == 200){
            let data = JSON.parse(body);
            if(data.errcode == 1)
            {
                //已经注册的用户，那么先获取用户的用户名等信息
                console.log('execute user.ejs')
                res.render('user.ejs',{
                    id : id,
                    username : data.username          //获取接口传递过来的username(数据库的username)
                    //输送用户信息到user.ejs
                })
                //res.end();   //存在用户直接跳转到用户界面
            }
            else
            {
                res.render('register.ejs',{      //获取的微信用户数据传递给register
                    data : 
                    {
                        username : req.query.username,
                        openid : req.query.openid,
                        sex : req.query.sex,
                        groupid : req.query.groupid
                    }
                })
                // res.send(JSON.stringify({errcode:'0',errmsg:"注册成功"}));
            }
        }
    })
    
});

router.get('/registerOk',(req,res,next)=>{
    console.log('come in registerOk');
    res.render('registerOk',{});
});

router.get('/pieChart',(req,res,next)=>{
    let {type} = req.query;
    let sql = "";
    if(type == "1")
    {
        sql = `SELECT sex as name,count(*) as value FROM user_table GROUP BY sex`; 
    }
    else if(type == "2")
    {
        sql = `SELECT level as name,count(*) as value FROM user_table GROUP BY level`;
    }

    req.sequelize.query(sql,
        { replacements: {},type : req.sequelize.QueryTypes.SELECT})
        .then(result =>{
            let temp_data = result.map((item,index)=>{
                if(type == "1")
                {
                    if(item.name == "1")
                    {
                        item.name = "男";
                    }
                    else if(item.name == "2"){
                        item.name = "女";
                    }
                }
                else if(type == "2")
                {
                    if(item.name == "1")
                    {
                        item.name = "MUSEE会员";
                    }
                    else if(item.name == "2"){
                        item.name = "Vip会员";
                    }
                }
                return{
                    name : item.name,
                    value : item.value
                }
            });
            let arr = [];
            temp_data.map((item, index)=>{
                arr.push(item.name);
            })
            res.send(JSON.stringify({errcode:"0",errmsg:"",y_data:JSON.stringify(temp_data),x_data:JSON.stringify(arr)}));
        })
});

router.get('/year',(req,res,next)=>{
    let sql = `SELECT FROM_UNIXTIME(createTime/1000,"%Y") as year FROM user_table GROUP BY FROM_UNIXTIME(createTime/1000,"%Y") ORDER BY createTime DESC`;
    req.sequelize.query(sql,
        { replacements: {},type : req.sequelize.QueryTypes.SELECT})
        .then(result =>{
            res.send(JSON.stringify({errcode:"0",errmsg:"",result:JSON.stringify(result)}));
        });
});

router.get('/lineChart',(req,res,next)=>{
    let {year} = req.query;
    let sql = `SELECT FROM_UNIXTIME(createTime/1000,"%m") as month,count(FROM_UNIXTIME(createTime/1000,"%m")) as count FROM user_table where FROM_UNIXTIME(createTime/1000,"%Y") =:year GROUP BY FROM_UNIXTIME(createTime/1000,"%m") ORDER BY createTime DESC`;
    req.sequelize.query(sql,
        { replacements: {year : year}, type : req.sequelize.QueryTypes.SELECT})
        .then(result =>{
            let arr = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
            let temp_data = [];
            for(let i=0;i<arr.length;i++)
            {
                try{
                    if(result[i].month && parseInt(arr[i]).toString() == parseInt(result[i].month).toString())
                    {
                        temp_data.push(result[i].count);
                    }
                }
                catch(e)
                {
                    temp_data.push(0);
                }
            }
            res.send(JSON.stringify({errcode:"0",errmsg:"",x_data:JSON.stringify(arr),y_data:JSON.stringify(temp_data)}));
        });

})
module.exports = router;