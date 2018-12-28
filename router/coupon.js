const express = require('express');
const router = express.Router();
const common = require('./../common/common');

router.post('/post',(req,res,next)=>{
    let {ID,username,startTime,endTime,isUse,useTime,amount} = req.body;
    req.Coupon_Model.create({
        id : ID,
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





module.exports = router;