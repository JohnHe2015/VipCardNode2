const express = require('express');
const router = express.Router();
const common = require('./../common/common');

router.get('/isLogin',(req,res,next)=>{    //判断微信用户是否存在，存在则直接跳转到card页面
    console.log('come in isLogin');
    console.log(JSON.stringify(req.query));
    let id = req.query.id;
    req.User_Model.findOne({ where: {id: id}}).then(data =>{
        console.log(JSON.stringify(data));
        if(data != null)
        {
            console.log('come in 1');
            res.end(JSON.stringify({errcode : "1", errmsg : "该用户已存在",username : data.username,id : data.id}));   //存在,并传递用户名和id给用户ejs
        }
        else{
            console.log('come in 2');
            res.end(JSON.stringify({errcode : "0", errmsg : "该用户不存在可以注册"}));   //不存在
        }
    })

});

module.exports = router;