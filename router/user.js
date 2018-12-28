const express = require('express');
const router = express.Router();
const common = require('./../common/common');

router.get('/get',(req,res,next)=>{
    let {username,mobile,birthday,sex,level} = req.query;
    let whereParams = {};
    if(username) whereParams.username = {[req.Op.like]: `%${username}%`};
    if(mobile) whereParams.mobile = {[req.Op.like]: `%${mobile}%`};
    if(birthday) whereParams.birthday = birthday;
    if(sex) whereParams.sex = sex;
    if(level) whereParams.level = level;
    req.User_Model.findAll({
        where : whereParams, 
        raw:true,
        offset:0,    //分页暂时先写死
        limit:2
    }).then(data =>{
        console.log(data);
    })
});


router.post('/post',(req,res,next)=>{
    let {ID,username,password,mobile,birthday,sex,level} = req.body;
    req.User_Model.save({

    }).then(data =>{

    })
});

router.post('/posttemp',(req,res,next)=>{
    let {username,password,mobile,birthday,sex} = req.body;
    req.Usertemp_Model.create({
        id : common.uuid(),
        username : username,
        password : common.md5(password),
        mobile : mobile,
        birthday : birthday,
        sex : sex,
        level : 1,
        createTime : common.getTime()
    }).then(data =>{
        console.log(data);
    })
});
module.exports = router;