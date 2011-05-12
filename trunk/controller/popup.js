/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var data=null;
var imgs=[];
var ReaderPOPUP={
    /**
     * cut text and test if it's white space or not.
     */
    cutText:function(text,indexB,append){
        if(text==null|| text.length ==0){
            return '';
        }
        for( i =0 ; i< 20 ; i++){
            if(text.charAt( indexB) != " "){
                indexB++;
            }else{
                i=20;
            }
        }
        return text.substring(0, indexB)+" "+append;
    },
    /**
     * get the menu items.
     */
    menu:function(){
        var out='';
        for(i=0; i<data.channels.length; i++){
            if(data.channels[i].active == true && data.channels[i].category == 'news'){
                out+='<li onclick="ReaderPOPUP.openCategory(this.id)" id="'+data.channels[i].id+'">';
                if(data.channels[i].unreaditems > 0){
                    out+='<span class="new-news">'+data.channels[i].unreaditems+'</span>';
                }
                out+='<a>';
                out+=data.channels[i].title;
                out+='</a>';
                out+='</li>';
            }
        }
        if(data.mutlimedia.active){
            console.log(data.mutlimedia.active)
            out+='<li id="media"><a>ملتميديا</a></li>';
        }
        return out;
    },
    /**
     * constructor
     */
    ReaderPOPUP:function(){
        data=JSON.parse(window.localStorage.data);
        $("ul#tabs-menu").html(ReaderPOPUP.menu());

        var ils=$("ul#tabs-menu").children('li')
        var ilswidth=0;
        ils.slice(0, 4).each(function(){
            ilswidth+=parseInt($(this).width());
        });
        var maxInrow=4;
        if(ilswidth > 240){
            maxInrow =3;
        }
        if(ils.length > maxInrow){
            $("#dropDown").show();
            $("#dropDownItems").append(ils.slice(maxInrow));
        }
        
        if(window.localStorage.lastTab){
            var lastTab=JSON.parse(window.localStorage.lastTab);
            switch(lastTab.type){
                case 'news':{
                    ReaderPOPUP.openCategory(lastTab.id);
                    break;
                }
                default : {
                    $($('#tabs-menu').children()[0]).trigger('click');
                }
            }
        }else{
            $($('#tabs-menu').children()[0]).trigger('click');
        }
        chrome.browserAction.setBadgeText({
            text:""
        });
        window.localStorage.badgeText=0;
    },
    /**
     * open category from menu clicking.
     */
    openCategory:function(id){
        $("#tab-multimedia").hide();
        $("#tabs-content").show();
        ReaderPOPUP.setCurrentTab(id);
        if(!window.localStorage['rss-cat-'+id]){
            $("#tabs-content").html('<center><br/><br/><br/><br/><br/><img align="center" src="images/elmasry_loader.gif" style="margin-top:100px;"/></center>');
            ReaderPOPUP.openTimeout=window.setTimeout(function(){
                ReaderPOPUP.openCategory(id);
            }, 1000);
            return;
        }
        window.clearTimeout(ReaderPOPUP.openTimeout);
        delete ReaderPOPUP.openTimeout;
        var cat=JSON.parse(window.localStorage['rss-cat-'+id]);
        var rows=ReaderPOPUP.getrows(cat);
        $("#tabs-content").html(rows.out);
        var lastTab={
            id:id,
            type:'news'
        }
        var dataid=parseInt(id);
        data.channels[dataid-1].unreaditems=0;
        window.localStorage.data=JSON.stringify(data);
        window.localStorage['rss-cat-'+id]=JSON.stringify(rows.list);
        window.localStorage.lastTab=JSON.stringify(lastTab);
        
        window.setTimeout(function(){
            ReaderPOPUP.removeUreadCountLable(id);
        }, 1000 * 1)
    },
    openMutimediaTab:function(){
        $("#tabs-content").hide();
        $("#tab-multimedia").show();
        ReaderPOPUP.setCurrentTab('media');
        ReaderPOPUP.openVideoTab();
        window.clearTimeout(ReaderPOPUP.openTimeout);
        delete ReaderPOPUP.openTimeout;
    },
    openVideoTab:function(){
        var Item=data.mutlimedia.video;
        $(".active-tab").removeClass('active-tab');
        $("#openVideo").addClass('active-tab');
        ReaderPOPUP.multiMedia(Item);
    },
    openCarTab:function(){
        var Item=data.mutlimedia.car;
        $(".active-tab").removeClass('active-tab');
        $("#openCar").addClass('active-tab');
        ReaderPOPUP.multiMedia(Item);
    },
    multiMedia:function(item){
        if(! window.localStorage['rss-cat-'+item.id]){
            ReaderPOPUP.ReaderPOPUP();
        }
        var lastTab={
            type:'video'
        }
        window.localStorage.lastTab=JSON.stringify(lastTab);
        var rows=ReaderPOPUP.getMultiMediaRow(JSON.parse(window.localStorage['rss-cat-'+item.id]));
        $("#videoTab").html(rows.out);
        window.localStorage['rss-cat-'+item.id]=JSON.stringify(rows.list);
    },
    /**
     * generate the rows from list of objects
     */
    getrows:function(list){
        imgs=[];
        var out="";
        for(var i =0;i<list.length;i++){
            out+='<div class="news-box '+(list[i].unread == true?'news-box-unread':'')+'">';
            list[i].unread = false;
            if(list[i].img == null || list[i].img == ''){
                out+='<div class="box-news-left box-news-nophoto">';
            }else{
                imgs.push({
                    id:i,
                    src:list[i].img
                })
                out+='<div class="news-photo"><img alt="'+list[i].title+'" id="img-'+i+'"></img></div>';
                out+='<div class="box-news-left">';
            }
            out+='<div class="box-news-title"><a style="cursor:pointer;" onclick="extension.openURL(\''+list[i].link+'\');">'+list[i].title+'</a></div>';
            out+='<div class="box-news-brief">';
            out+=ReaderPOPUP.cutText(list[i].description, 150, "...");
            out+='</div>';
            out+='</div>';
            out+='</div>';
        }
        //special for sabq
        window.setTimeout("ReaderPOPUP.setImages()", 5);
        return {
            out:out,
            list:list
        };
    },
    getMultiMediaRow:function(list){
        var out='';
        for(i in list){
            out+='<div class="video">';
            out+='<div onclick="ReaderPOPUP.openURL(\''+list[i].link+'\');" class="video-title">'+list[i].title+'</div>';
            out+='<div style="cursor: pointer;"><img onclick="extension.openURL(\''+list[i].link+'\');" src="'+list[i].img+'" width="154" height="86" /></div>';
            out+='</div>';
        }
        return {
            out:out,
            list:list
        };
    },
    /**
     * add current class to current tab
     */
    setCurrentTab:function(tabid){
        $('.current').removeClass('current');
        $('#'+tabid).addClass('current');
    },
    /**
     * removed the unread items count from the tab.
     */
    removeUreadCountLable:function(id){
        if($(document.getElementById(id).firstChild).hasClass('new-news')){
            $(document.getElementById(id).firstChild).remove();
        }
    },
    /**
     * special for sabq images
     */
    setImages:function(){
        for(i=0;i<imgs.length;i++){
            $('#img-'+imgs[i].id).attr('src',imgs[i].src);
        }
    },
    domEvents:function(url){
        $("#settings").click(function(){
            extension.openOptionPage();
        });
        $("#media").click(function(){
            ReaderPOPUP.openMutimediaTab();
        });
        $("#openVideo").click(function(){
            ReaderPOPUP.openVideoTab();
        });
        $("#openCar").click(function(){
            ReaderPOPUP.openCarTab();
        });
    },
    getChannelItem:function(itemId){
        var data=JSON.parse(window.localStorage.data);
        for(i in data.channels){
            if(data.channels[i].id == itemId){
                return data.channels[i];
            }
        }
        return null;
    }
}
$(function(){
    ReaderPOPUP.ReaderPOPUP();
    ReaderPOPUP.domEvents();

    
});
