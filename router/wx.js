//微信管理的接口
const express = require('express');
const router = express.Router();
const request = require('request');
const WechatApi = require('wechat-api');
const wxConfig = require('./../config/wx.config')
const api = new WechatApi(wxConfig.wx.appID,wxConfig.wx.appsecret);
const utils = require('./../common/common');
const parseString = require('xml2js').parseString;

//一键同步pull微信数据到本地库(包括用户信息表,分组参数表)
router.get('/sync',(req,res,next)=>{

})

//获取分组信息,最终需要同步到数据库
router.get('/groups/get',(req,res,next)=>{
    api.getGroups((err,result)=>{
        if(err)
        {
            console.log('和微信接口对接失败,请重试');
        }
        else
        {
            console.log('查询分组结果为: ' +result);
            res.end(JSON.stringify(result));
        }
    });

});

//创建分组
router.post('/groups/post',(req,res,next)=>{
    api.getGroups((err,result)=>{
        if(err)
        {
            console.log('和微信接口对接失败,请重试');
        }
        else
        {
            console.log('查询分组结果为: ' +result);
            res.end(JSON.stringify(result));
        }
    });
});

//获取公众号所有关注者的信息    并同步到数据库的接口
router.post('/groups/post',(req,res,next)=>{
    api.getFollowers((err,result)=>{
        if(err)
        {
            console.log('和微信接口对接失败,请重试');
        }
        else
        {
            api.batchGetUsers(JSON.parse(JSON.stringify(result.data.openid)),(err,result)=>{
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    console.log(JSON.stringify(result.user_info_list));
                }
            })
        }
    });
});


router.get('/config/get',(req,res,next)=>{
    var param = {
        debug : true,
        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'],
        url: 'http://zhengshuqin.xyz',
    }
    api.getJsConfig(param, (err,result)=>{
        if(err) console.log(err)
        else
        {
            res.end(JSON.stringify(result));
        }
    });
})

router.get('/auth',(req,res,next)=>{       //第三方菜单认证接口
    var router = 'wx/get_wx_access_token';
    // 这是编码后的地址
    //var return_uri = encodeURIComponent('http://m.zhengshuqian.com/index.html'+router);
    var return_uri = encodeURIComponent('http://api.zhengshuqian.com/'+router);
    var scope = 'snsapi_userinfo';
    res.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${wxConfig.wx.appID}&redirect_uri=${return_uri}&response_type=code&scope=${scope}&state=STATE#wechat_redirect`);
    //res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+AppID+'&redirect_uri='+return_uri+'&response_type=code&scope='+scope+'&state=STATE#wechat_redirect');

})



router.get('/get_wx_access_token', function(req,res, next){
    //console.log("get_wx_access_token")
    //console.log("code_return: "+req.query.code)
    // 第二步：通过code换取网页授权access_token
    var code = req.query.code;
    request.get(
        {   
            url:`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wxConfig.wx.appID}&secret=${wxConfig.wx.appsecret}&code=${code}&grant_type=authorization_code`,
        },
        function(error, response, body){
            if(response.statusCode == 200){
                
                // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
                //console.log(JSON.parse(body));
                var data = JSON.parse(body);
                var access_token = data.access_token;
                var openid = data.openid;
                
                request.get(
                    {
                        url:'https://api.weixin.qq.com/sns/userinfo?access_token='+access_token+'&openid='+openid+'&lang=zh_CN',
                    },
                    function(error, response, body){
                        if(response.statusCode == 200){
                            
                            // 第四步：根据获取的用户信息进行对应操作
                            var userinfo = JSON.parse(body);
                            console.log('获取微信信息成功！');
                            console.log(JSON.stringify(userinfo));
                            res.redirect(`http://m.zhengshuqian.com/register?username=${userinfo.nickname}&openid=${openid}&sex=${userinfo.sex}&groupid=${userinfo.groupid}`);
                            
                        }else{
                            console.log(response.statusCode);
                        }
                    }
                );
            }else{
                console.log(response.statusCode);
            }
        }
    );
});

router.get('/sendText',(req,res,next)=>{       // 发送普通消息的接口
    console.log("接口收到的id为:" +req.query.id);
    api.sendText(req.query.id, '宝贝哈哈哈哈哈哈，你通过了哈尼的审核咯', (err,result)=>{
        if(err) console.log(err);
        else
        {
            console.log(result);
            res.end();
        }
    });
});



router.get('/sendTemplate',(req,res,next)=>{   //发送模版消息接口
    let templateId = "f1xFDHktBFr3KxxrAjdU_V5D_V1jV-Do0_bQ6eQ7uM8";   //发送消息的模版ID
    let url = "api.zhengshuqian.com/coupon.html";
    console.log(`type3Sum : ${req.query.type3Sum}`);
    let data = {
        "level":{
            "value" : req.query.level == 1 ? "普通会员" : "Vip会员",
            "color" : "#173177"
        },
        "type1" : {
            "value" : req.query.type1,
            "color" : "#173177"
        },
        "type2" : {
            "value" : req.query.type2,
            "color" : "#173177"
        },
        "type3" : {
            "value" : req.query.type3,
            "color" : "#173177"
        },
        "type1Sum" : {
            "value" : req.query.type1Sum,
            "color" : "#173177"
        },
        "type2Sum" : {
            "value" : req.query.type2Sum,
            "color" : "#173177"
        },
        "type3Sum" : {
            "value" : req.query.type3Sum,
            "color" : "#173177"
        }
    }
    api.sendTemplate(req.query.id, templateId, url, data, (err,result)=>{
        if(err) console.log(err);
        else{
            console.log(result);
            res.end();
        }
    });

})

router.post('/generateQR',(req,res,next)=>{
    console.log('进入生成QR方法');
    let {id,count,type,startTime,endTime} = req.body;
    let data = id+'_'+type+'_'+startTime+'_'+endTime+'_'+count;
    api.createTmpQRCode(data, 1800, (err,result)=>{
        if(err){
            console.log(err);
        }
        else
        {
            let imgSrc = api.showQRCodeURL(result.ticket);
            console.log(imgSrc);
            res.send(JSON.stringify({errcode : "0", errmsg : "生成成功", result : imgSrc}));
        }
    });
});


router.all('/eventTrigger',(req,res,next)=>{   //既接收get也接收事件post的xml数据
    console.log(req.query);
    let {signature, echostr, openid, timestamp, nonce} = req.query;
    let arr = new Array();
    arr[0] = nonce;
    arr[1] = timestamp;
    arr[2] = wxConfig.wx.token;

    arr.sort();
    let original = arr[0] + arr[1] + arr[2];
    console.log('original:'+ original);
    let cryptoStr = utils.sha1(original);              
    console.log("加密后的字符串为:"+cryptoStr)
    if(cryptoStr == signature)                        //验证微信签名是否和加密字符串相等
    {
        console.log('验证通过')
        req.on('data',(data)=>{
            console.log(data.toString());
            let jsonData;
            parseString(data.toString(),(err,result)=>{     //解析xml
                if(err){
                    console.log('解析xml数据失败');
                    res.send(JSON.stringify({errcode : '400', errmsg : "parse xml failed"}))
                }
                else
                {
                    console.log(result.xml);
                    jsonData = result.xml;
                }
            })

            //public attributes
            let msgType = jsonData.MsgType[0];
            let openid = jsonData.FromUserName[0];
            let createTime = jsonData.CreateTime[0];
            //private attributes
            let content;
            
            if(msgType == "text")  //微信消息事件
            {
                console.log('wx msg push event')
                content = jsonData.Content[0];    //message content
                if(content == "520" || content == "哈尼")
                {
                    api.sendText(openid, '宝贝，你竟然猜中了密码', (err,result)=>{
                        if(err) console.log(err);
                    });
                }
                res.send('success');
            }
            else if(msgType == "event" )  
            {
                let event = jsonData.Event[0];
                if(event == "SCAN"){             //客户扫描二维码事件
                    console.log('wx scanQR push event')
                    let eventKey = jsonData.EventKey[0];      //eventKey就是二维码参数scen_id
                    //扫描二维码核销优惠券
                    console.log('二维码参数为 : '+ eventKey);
                    let arr = eventKey.split('_');
                    request.get(
                        {   
                            url:`http://api.zhengshuqian.com/coupon/verification?id=${arr[0]}&type=${arr[1]}&startTime=${arr[2]}&endTime=${arr[3]}&count=${arr[4]}`,
                        },
                        function(error, response, body){
                            if(error){
                                res.send(JSON.stringify({errcode : "400", errmsg : "核销失败"}));
                            }
                            let data = JSON.parse(body);
                            if(response.statusCode == 200){
                                if(data.errcode == "0" )   //核销成功
                                {
                                    console.log('errcode == 0');
                                    res.redirect('http://m.zhengshuqian.com/coupon/result');
                                }
                            }
                    })                
                    
                    //res.send('success');
                }
                res.redirect('http://m.zhengshuqian.com/coupon/result');
            }
            else
            {
                res.redirect('http://m.zhengshuqian.com/coupon/result');
                //res.send('no other');
            }



        })
    }
    else   //认证失败，直接返回错误
    {
        res.redirect('http://m.zhengshuqian.com/coupon/result');
        //res.send("请求非法");
    }
   
})


module.exports = router;