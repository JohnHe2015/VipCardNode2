//微信管理的接口
const express = require('express');
const router = express.Router();
const request = require('request');
const WechatApi = require('wechat-api');
const wxConfig = require('./../config/wx.config')
const api = new WechatApi(wxConfig.wx.appID,wxConfig.wx.appsecret);

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


//获取临时二维码的url地址
router.get('/qrcord/get',(req,res,next)=>{
    api.createTmpQRCode(10000, 1800, (err,result)=>{
        if(err){
            console.log(err);
        }
        else
        {
            console.log(api.showQRCodeURL(result.ticket));
            log.info(api.showQRCodeURL(result.ticket));
        }
    });
})

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

router.get('/auth',(req,res,next)=>{
    var router = 'wx/get_wx_access_token';
    // 这是编码后的地址
    var return_uri = encodeURIComponent('http://96a7f651.ngrok.io/'+router);
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
                            //console.log(JSON.parse(body));
                            console.log('获取微信信息成功！');
                            
                            // 小测试，实际应用中，可以由此创建一个帐户
                            res.send("\
                                <h1>"+userinfo.nickname+" 的个人信息</h1>\
                                <p><img src='"+userinfo.headimgurl+"' /></p>\
                                <p>"+userinfo.city+"，"+userinfo.province+"，"+userinfo.country+"</p>\
                            ");
                            
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


module.exports = router;