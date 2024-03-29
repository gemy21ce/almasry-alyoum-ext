/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var background=chrome.extension.getBackgroundPage();
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
    menu:function(order){
        var out='';
        var channels=data.channels;
        if(order){
            for(z=0; z < order.length; z++){
                if(isNaN(order[z])){
                    if(data.multimedia.active){
                        out+='<li id="media"><a>'+data.multimedia.title+'</a></li>';
                    }
                    continue;
                }
                if(channels[parseInt(order[z])-1].active == true){
                    out+='<li onclick="ReaderPOPUP.openCategory(this.id)" id="'+channels[parseInt(order[z])-1].id+'">';
                    if(channels[parseInt(order[z])-1].unreaditems > 0){
                        out+='<span class="new-news">'+channels[parseInt(order[z])-1].unreaditems+'</span>';
                    }
                    out+='<a>';
                    out+=channels[parseInt(order[z])-1].title;
                    out+='</a>';
                    out+='</li>';
                }
            }
        }else{
            for(i=0; i<channels.length; i++){
                if(data.channels[i].active == true && channels[i].category == 'news'){
                    out+='<li onclick="ReaderPOPUP.openCategory(this.id)" id="'+channels[i].id+'">';
                    if(channels[i].unreaditems > 0){
                        out+='<span class="new-news">'+channels[i].unreaditems+'</span>';
                    }
                    out+='<a>';
                    out+=channels[i].title;
                    out+='</a>';
                    out+='</li>';
                }
            }
            if(data.multimedia.active){
                out+='<li id="media"><a>'+data.multimedia.title+'</a></li>';
            }
        }
        return out;
    },
    /**
     * constructor
     */
    ReaderPOPUP:function(){
        if(window.localStorage.lang == 'en'){
            data=JSON.parse(window.localStorage.data_en);
        }else{
            data=JSON.parse(window.localStorage.data);
        }
        var dataOrder = JSON.parse(window.localStorage.dataOrder);
        $("ul#tabs-menu").html(ReaderPOPUP.menu(dataOrder));

        ReaderPOPUP.dropDownMenuAction();
        
        if(window.localStorage.lastTab){
            var lastTab=JSON.parse(window.localStorage.lastTab);
            if(lastTab.type == 'news' && window.localStorage['rss-cat-'+lastTab.id]){
                ReaderPOPUP.openCategory(lastTab.id);
            }else{
                $($('#tabs-menu').children()[0]).trigger('click');
            }
        }else{
            $($('#tabs-menu').children()[0]).trigger('click');
        }
        chrome.browserAction.setBadgeText({
            text:""
        });
        window.localStorage.badgeText=0;
    },
    dropDownMenuAction:function(){
        var ils=$("ul#tabs-menu").children('li')
        var ilswidth=0;
        ils.slice(0, 4).each(function(){
            ilswidth+=parseInt($(this).width());
        });
        var maxInrow=4;
        if(ilswidth > 225){
            maxInrow =3;
        }
        if(ils.length > maxInrow){
            $("#dropDown").show();
            $("#dropDownItems").append(ils.slice(maxInrow));
        }
    },
    /**
     * open category from menu clicking.
     */
    openCategory:function(id){
        $("#tab-multimedia").hide();
        $("#tabs-content").show();
        ReaderPOPUP.setCurrentTab(id);
        if(!window.localStorage['rss-cat-'+id]){
            chrome.extension.sendRequest({
                action:'update',
                ob:[id]
            });
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
        if(window.localStorage.lang == 'ar'){
            window.localStorage.data=JSON.stringify(data);
        }else{
            window.localStorage.data_en=JSON.stringify(data);
        }
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
        var Item=data.multimedia.video;
        $(".active-tab").removeClass('active-tab');
        $("#openVideo").addClass('active-tab');
        ReaderPOPUP.multiMedia(Item);
    },
    openCarTab:function(){
        var Item=data.multimedia.car;
        $(".active-tab").removeClass('active-tab');
        $("#openCar").addClass('active-tab');
        ReaderPOPUP.multiMedia(Item);
    },
    multiMedia:function(item){
        $("#videoTab").html('<center><br/><br/><br/><br/><br/><img align="center" src="images/elmasry_loader.gif" style="margin-top:100px;"/></center>')
        if(! window.localStorage['rss-cat-'+item.id]){
            chrome.extension.sendRequest({
                action:'update'
            });
            return;
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
            out+='<div class="box-news-title"><a style="cursor:pointer;" onclick="extension.openURL(\''+list[i].link+'\',false);">'+list[i].title+'</a></div>';
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
            out+='<div onclick="extension.openURL(\''+list[i].link+'\');" class="video-title">'+list[i].title+'</div>';
            out+='<div style="cursor: pointer;"><img onclick="extension.openURL(\''+list[i].link+'\',false);" src="'+list[i].img+'" width="154" height="86" /></div>';
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
        $("#searchForm").submit(function(){
            if($("#searchText").val() == ""){
                return false;
            }
            $("#tab-multimedia").hide();
            $("#tabs-content").show();
            $("#tabs-content").html('<center><br/><br/><br/><br/><br/><img align="center" src="images/elmasry_loader.gif" style="margin-top:100px;"/></center>');
            $("#tabs-menu").hide();
            $("#dropDown").hide();
            $("#searchResults").show().children("li").addClass("current");
            ReaderPOPUP.doSearch($("#searchText").val());
            return false;
        });
        $("#closeSearch").click(function(){
            $("#tabs-menu").show();
            $("#searchResults").hide();
            $("#searchText").val("");
            ReaderPOPUP.ReaderPOPUP();
        });
        $("#logo").click(function(){
            extension.openURL($('#clickURL').html(),false);
        })
    },
    getChannelItem:function(itemId){
        var data=JSON.parse(window.localStorage.data);
        for(i in data.channels){
            if(data.channels[i].id == itemId){
                return data.channels[i];
            }
        }
        return null;
    },
    search:function(keyword,fn,error){
        if(! keyword || keyword == ""){
            error({
                message:"empty or null keyword!!!",
                status:500
            });
        }
        var gnsearchURL="http://news.google.com.eg/news?pz=1&cf=all&ned=ar_eg&hl=ar&q=site:http://www.almasryalyoum.com+";
        var gnComp="&cf=all&output=rss";
        background.jQuery.getFeed({
            url:gnsearchURL+keyword+gnComp,
            success:function(rss){
                fn(rss);
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){
                error(textStatus);
            }
        });
    },
    doSearch:function(keyword){
        ReaderPOPUP.search(keyword,function(rss){
            var el,origin=[];
            for(var i=0;i<rss.items.length;i++){
                el=background.util.parseHTML(rss.items[i].description);
                var element={
                    title:rss.items[i].title,
                    link:rss.items[i].link,
                    description:background.util.cutText(el.description, 150, '.'),
                    img:el.imgsrc == 'le border='?null:el.imgsrc,
                    updated:new Date(rss.items[i].updated).getTime(),
                    unread:true
                }
                origin.push(element);
            }
            if(origin.length > 0){
                var rows=ReaderPOPUP.getrows(origin);
                $("#tabs-content").html(rows.out);
            }else{
                $("#tabs-content").html($("#noresult").html());
            }
        },function(message){
            console.log(message);
            if(message.status == 500){
                $("#tabs-content").html("empty search key")
            }
        })
    }
}
$(function(){
    ReaderPOPUP.ReaderPOPUP();
    ReaderPOPUP.domEvents();

    
});
