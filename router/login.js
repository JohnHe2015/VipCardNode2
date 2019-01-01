const express = require('express');
const router = express.Router();
const common = require('./../common/common');

router.get('/isLogin',(req,res,next)=>{    //判断微信用户是否存在，存在则直接跳转到card页面
    let {id} = req.query.id;
    req.User_Model.findById(id).then(data =>{
        if(data.length > 0)
        {
            res.end({errcode : 1});   //存在
        }
        else{
            res.end({errcode : 0});   //不存在
        }
    })

});

module.exports = router;