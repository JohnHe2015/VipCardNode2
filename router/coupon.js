//后期优惠券数量是动态的
const express = require('express');
const router = express.Router();
const common = require('./../common/common');

router.post('/post',(req,res,next)=>{
    let insertBatch = [];
    let createTime = common.getTime();
    let {id,username,startTime,endTime,isUse,useTime,amount} = req.body;
    req.sequelize.transaction( (t)=>{
        if(amount < 5000)   //单次消费不满5000元的情况
        {
            for(let i=0;i<2;i++)  //发放2张咖啡券
            {
                insertBatch.push(
                    req.Coupon_Model.create({
                        id : id,
                        username : username,
                        type : 1,
                        rate : 0,
                        startTime : startTime,
                        endTime : endTime,
                        isUse : isUse,
                        useTime : useTime,
                        createTime : createTime
                    })
                )
            }
        }
        else
        {
            for(let i=0;i<6;i++)   //发放6张咖啡券
            {
                insertBatch.push(
                    req.Coupon_Model.create({
                        id : id,
                        username : username,
                        type : 1,
                        rate : 0,
                        startTime : startTime,
                        endTime : endTime,
                        isUse : isUse,
                        useTime : useTime,
                        createTime : createTime
                    })
                )
            }

            insertBatch.push(              //1张9.5折拍摄券
                req.Coupon_Model.create({
                    id : id,
                    username : username,
                    type : 2,
                    rate : 0.95,
                    startTime : startTime,
                    endTime : endTime,
                    isUse : isUse,
                    useTime : useTime,
                    createTime : createTime
                })
            )
            for(let i=0;i<2;i++)
            { 
                insertBatch.push(
                    req.Coupon_Model.create({        //2张9折摄影产品券
                        id : id,
                        username : username,
                        type : 3,
                        rate : 0.9,
                        startTime : startTime,
                        endTime : endTime,
                        isUse : isUse,
                        useTime : useTime,
                        createTime : createTime
                    })
                )
            }
        }
        //batch push finished ,return 
        return Promise.all(insertBatch)
    }).then(data =>{
        res.end(JSON.stringify({errcode : "0", errmsg : "优惠券已发放！"}));
    }).catch(err =>{
        res.end(JSON.stringify({errcode : "400", errmsg : err}));
    })
   
});

router.get('/get',(req,res,next)=>{
    let {username,type,rate,startTime,endTime,isUse,useTime,createTime} = req.query;
    //let offset = (parseInt(page)-1) * parseInt(pageSize);  //偏移量
    //let limit = parseInt(pageSize);                        //一页显示条数
    let whereParams = {};
    if(username) whereParams.username = {[req.Op.like]: `%${username}%`};
    if(type) whereParams.type = type;
    if(isUse) whereParams.birthday = isUse;
    //if(sex) whereParams.sex = parseInt(sex);
    //if(level) whereParams.level = parseInt(level);
    req.User_Model.findAndCountAll({
        where : whereParams, 
        raw:true,
        //offset: offset,
        //limit: limit
    }).then(data =>{
        res.end(JSON.stringify({errcode : "0", errmsg : "success",result : data.rows, count : data.count}));
    }).catch(err =>{
        res.end(JSON.stringify({errcode : "400", errmsg : err}));
    })
})





module.exports = router;