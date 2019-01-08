//后期优惠券数量是动态的
const express = require('express');
const router = express.Router();
const common = require('./../common/common');
const QRCode = require('qrcode');

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
    let {username,type,rate,startTime,endTime,isUse,useTime,createTime,page,pageSize} = req.query;
    let offset = (parseInt(page)-1) * parseInt(pageSize);  //偏移量
    let limit = parseInt(pageSize);                        //一页显示条数
    let whereParams = {};
    if(username) whereParams.username = {[req.Op.like]: `%${username}%`};
    if(type) whereParams.type = type;
    if(isUse) whereParams.birthday = isUse;
    //if(sex) whereParams.sex = parseInt(sex);
    //if(level) whereParams.level = parseInt(level);
    req.Coupon_Model.findAndCountAll({
        where : whereParams, 
        raw:true,
        offset: offset,
        limit: limit
    }).then(data =>{
        res.end(JSON.stringify({errcode : "0", errmsg : "success",result : data.rows, count : data.count}));
    }).catch(err =>{
        res.end(JSON.stringify({errcode : "400", errmsg : err}));
    })
})

router.get('/:id',(req,res,next)=>{    //查询用户未使用的优惠券接口
    let id = req.params.id;
    //select count(type),type,startTime,endTime from coupon_table where username='edwdwa' GROUP BY type,endTime order by endTime ;
    req.sequelize.query('SELECT COUNT(type) AS count, id, type, rate, startTime, endTime FROM coupon_table WHERE id = :id AND isUse = :isUse GROUP BY type,endTime,rate ORDER BY endTime',
    {replacements: { id : id , isUse : 0}, type: req.sequelize.QueryTypes.SELECT})
    .then(result=>{
        if(result != null)
        {
            console.log("查到的优惠券是:" +JSON.stringify(result));
            //res.send(JSON.stringify({errcode : "0", errmsg : "传递成功", result : JSON.stringify(result) }))
            res.render('coupon.ejs',{
                data : result 
            });
        }
        else
        {
            //res.send(JSON.stringify({errcode : "1", errmsg : "没有优惠券！"}))
            res.render('coupon.ejs',{
                data : {} 
            });
        }
    })
});


router.get('/verification',(req,res,next)=>{    //核销优惠券
    let {id,type,startTime,endTime,count} = req.query;
    type = parseInt(type);
    count = parseInt(count);
    let useTime = new Date().getTime();
    req.sequelize.query('UPDATE coupon_table SET isUse = :isUse , useTime = :useTime where id = :id and type = :type and isUse = 0 and startTime = :startTime and endTime = :endTime LIMIT :count',
    { replacements: {isUse : 1, useTime : useTime, id : id, type : type, startTime : startTime, endTime : endTime, count : count},type : req.sequelize.QueryTypes.UPDATE})
    .then(result =>{
        //res.send(JSON.stringify({errcode : "0", errmsg : "核销成功！"}))
        res.redirect('http://m.zhengshuqian.com/coupon/success');     //成功核销，回调渲染ejs
    })
});

 
router.get('/history/:id',(req,res,next)=>{        //优惠券兑换历史接口
    let id = req.params.id;
    req.sequelize.query('SELECT COUNT(type) AS count, id, type, rate, useTime FROM coupon_table WHERE id = :id AND isUse = :isUse GROUP BY type,useTime,rate ORDER BY useTime',
    {replacements: { id : id , isUse : 1}, type: req.sequelize.QueryTypes.SELECT})
    .then(result=>{
        if(result != null)
        {
            console.log("查到已使用的优惠券是:" +JSON.stringify(result));
            //res.send(JSON.stringify({errcode : "0", errmsg : "传递成功", result : JSON.stringify(result) }))
            res.render('history.ejs',{
                data : result 
            });
        }
        else
        {
            //res.send(JSON.stringify({errcode : "1", errmsg : "没有优惠券！"}))
            res.render('history.ejs',{
                data : {} 
            });
        }
    })
})

router.get('/generateQR/',(req,res,next)=>{
    let {id,type,count,startTime,endTime,cusType} = req.query;
    let url = `http://api.zhengshuqian.com/coupon/verification?id=${id}&type=${type}&startTime=${startTime}&endTime=${endTime}&count=${count}`;
    QRCode.toDataURL(url, (err, baseurl)=> {     //获取生成的二维码base64后渲染scan.ejs
        if(err) console.log(err)
        res.render('scan.ejs',{
            data : 
            {
                src : baseurl,
                type : cusType,
                count : count
            }
        })
    })
    
})


router.get('/success',(req,res,next)=>{ 
    res.render('result.ejs',{
    });
})


router.get('/detail/:id/:type/:startTime/:endTime/:count/:rate/',(req,res,next)=>{        //接收coupon.ejs的参数传递给detail页面
    let {id,count,endTime,startTime,type,rate} = req.params;
    var arr = [];
    let count_temp = parseInt(count);
    for(let i = 1;i <= count_temp ; i++)    //detail界面下拉框数组
    {
        arr.push({
            label: i.toString(),
            value: i
        })
    }
    let cusType;
    let _startTime;
    let _endTime;
    if(type == "1")
    {
        cusType = "MUSEE CAFE 咖啡券";
    }
    else if (type == "2")
    {
        cusType = (rate*10)+"折拍摄券";
    }
    else if (type == "3")
    {
        cusType = (rate*10)+"折摄影券";
    }
    _startTime = common.getDate2(parseInt(startTime));
    _endTime = common.getDate2(parseInt(endTime));
    res.render('couponDetail.ejs',{
        data : {
            id : id,
            arr : arr,
            type : type,
            cusType : cusType,
            startTime : startTime,
            endTime : endTime,
            _startTime : _startTime,
            _endTime : _endTime,
            count : count_temp
        }   
    });
});

module.exports = router;