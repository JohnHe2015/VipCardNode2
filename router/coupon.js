const express = require('express');
const router = express.Router();
const common = require('./../common/common');

router.post('/post',(req,res,next)=>{
    let createTime = common.getTime();
    let {id,username,startTime,endTime,isUse,useTime,amount} = req.body;
    sequelize.transaction( (t)=>{
        if(amount < 5000)   //单次消费不满5000元的情况
        {
            for(let i=0;i<2;i++)  //发放2张咖啡券
            {
                return req.Coupon_Model.create({
                    id : id,
                    username : username,
                    startTime : startTime,
                    endTime : endTime,
                    isUse : isUse,
                    useTime : useTime,
                    createTime : createTime
                })
            }   
        }
        else
        {
            for(let i=0;i<6;i++)   //发放6张咖啡券
            {
                return req.Coupon_Model.create({
                    id : id,
                    username : username,
                    startTime : startTime,
                    endTime : endTime,
                    isUse : isUse,
                    useTime : useTime,
                    createTime : createTime
                })
            }
        }

    }
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