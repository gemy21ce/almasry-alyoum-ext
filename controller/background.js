/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var notifications=[];
var VERSION_ID=1.0;
var ReaderBG={
    /**
     * contructor
     */
    ReaderBG:function(){
        var systemVersion=null;
        if(window.localStorage.sv){
            systemVersion=window.localStorage.sv;
        }
        if(VERSION_ID != systemVersion){
            for(i in window.localStorage){
                delete window.localStorage[i];
            }
            window.localStorage.sv = VERSION_ID;
        }
        if(! window.localStorage.data){
            window.localStorage.data=JSON.stringify(data);
        }
        if(! window.localStorage.data_en){
            window.localStorage.data_en=JSON.stringify(data_en);
        }
        if(! window.localStorage.dataOrder){
            window.localStorage.dataOrder = null;
        }
        ReaderBG.updateRSS();
        window.setInterval(function(){
            ReaderBG.updateRSS();
        }, 1000 * 60 * 60);
        function getNavigatorLang (){
            var lang=window.navigator.language;
            if(lang.indexOf("ar")!= -1){
                return 'ar';
            }else if(lang.indexOf("en")!= -1){
                return 'en';
            }else{
                return 'en';
            }
        }
        if(! window.localStorage.lang){
            window.localStorage.lang = getNavigatorLang();
        }
    },
    /**
     * read from url and process handler on success.
     */
    read:function(item,handler,type){
        jQuery.getFeed({
            url:item.url,
            success:function(rss){
                handler(rss,item.id,type);
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){
            }
        });
    /*$.ajax({
            url:item.url,
            dataType:'json',
            success:function(rss){
                handler(rss,item.id);
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){
            }
        });*/
    },
    /**
     * update method that will be called to update rss
     */
    updateRSS:function(updated){
        notifications=[];
        if(window.localStorage.lang == 'ar'){
            data=JSON.parse(window.localStorage.data);
        }else{
            data=JSON.parse(window.localStorage.data_en);
        }
        if(updated){
            for(s in updated){
                ReaderBG.read(data.channels[parseInt(updated[s])-1], ReaderBG.parseRSS);
            }
        }else{
            for(var i=0;i<data.channels.length;i++){
                if(data.channels[i].active==true){
                    ReaderBG.read(data.channels[i], ReaderBG.parseRSS);
                }
            }
        }
        if(data.multimedia.active){
            ReaderBG.read(data.multimedia.video, ReaderBG.parseRSS,'video');
            ReaderBG.read(data.multimedia.car, ReaderBG.parseRSS,'car');
        }
        window.setTimeout(function(){
            ReaderBG.runNotifications();
        }, 1000 * 60 );
    },
    parseRSS:function(rss,itemId,type){
        var origin=[];
        if(window.localStorage['rss-cat-'+itemId]){
            origin=JSON.parse(window.localStorage['rss-cat-'+itemId]);
        }
        var counter=ReaderBG.concatLists(origin, rss.items,'rss-cat-'+itemId);
        ReaderBG.setBadgeText(counter);
        var data=JSON.parse(window.localStorage.data);
        if(window.localStorage.lang == 'en'){
            data=JSON.parse(window.localStorage.data_en);
        }
        if(type){
            data.multimedia[type].unreaditems=counter;
        }else{
            data.channels[itemId-1].unreaditems=counter;
        }
        if(window.localStorage.lang == 'ar'){
            window.localStorage.data=JSON.stringify(data);
        }else{
            window.localStorage.data_en=JSON.stringify(data);
        }
        
    },
    /**
     * concatenate lists and return the number of unread items.
     */
    concatLists:function(origin,newlist,storeKey){
        var i=0;
        var counter=0;
        var el;
        if(origin.length == 0){
            for(i=0;i<newlist.length;i++){
                el=util.parseHTML(newlist[i].description);
                var element={
                    title:newlist[i].title,
                    link:newlist[i].link,
                    description:util.cutText(el.description, 150, '.'),
                    img:el.imgsrc,
                    updated:new Date(newlist[i].updated).getTime(),
                    unread:true
                }
                origin.push(element);
            }
            counter=i;
            window.localStorage[storeKey]=JSON.stringify(origin);
            origin[0].description=util.cutText(origin[0].description, 100);
            notifications.push(origin[0]);
            return counter;
        }
        i=0;
        while(i < newlist.length && (origin[0].updated != newlist[i].updated)){
            i++;
        }
        while(i > 0){
            el=util.parseHTML(newlist[i-1].description);
            origin.unshift({
                title:newlist[i-1].title,
                description:el.description,
                img:el.imgsrc,
                link:newlist[i-1].link,
                updated:newlist[i-1].updated,
                unread:true
            });
            origin.pop();
            counter++;
            i--;
        }
        window.localStorage[storeKey]=JSON.stringify(origin);
        origin[0].description=util.cutText(origin[0].description, 100);
        if(counter > 0){
            notifications.push(origin[0]);
        }
        return counter;
    },
    /**
     * fire the html nnotification.
     */
    fireNotification:function(title,img,description,link,close){
        var htmlPath='notification.html?'+'title='+encodeURIComponent(title)+"&img="+(img != null?encodeURIComponent(img):'images/logo.png')+"&desc="+encodeURIComponent(description)+"&link="+encodeURIComponent(link)+"&close="+close;
        var notification = webkitNotifications.createHTMLNotification(htmlPath);
        notification.show();
    },
    runNotifications:function(){
        if(window.localStorage.showNotification == 'off'){
            return;
        }
        if(notifications.length > 0){
            var close=window.localStorage.closeNotification;
            ReaderBG.fireNotification(notifications[0].title, notifications[0].img, notifications[0].description, notifications[0].link, close==0?null:close);
            notifications.shift();
            window.setTimeout(function(){
                ReaderBG.runNotifications();
            }, 1000 * 30);
        }
    },
    setBadgeText:function(text){
        if(! window.localStorage.badgeText){
            window.localStorage.badgeText=0;
        }
        text+=parseInt(window.localStorage.badgeText);
        var maxSelectedChannels=parseInt(window.localStorage.selectedChannels);
        if(text > maxSelectedChannels * 10){
            text = maxSelectedChannels * 10;
        }
        window.localStorage.badgeText=text;
        chrome.browserAction.setBadgeText({
            text:""+(text==0?'':text)
        });
    }
}
$(function(){
    ReaderBG.ReaderBG();
    if(! window.localStorage.showNotification){
        window.localStorage.showNotification = 'off';
    }
    if(! window.localStorage.closeNotification){
        window.localStorage.closeNotification = 0;
    }
})

function onRequest(request, sender, callback) {
    if(request.action=='update'){
        ReaderBG.updateRSS(request.ob);
    }
}
// Wire up the listener.
chrome.extension.onRequest.addListener(onRequest);