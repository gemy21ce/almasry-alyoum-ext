/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var MAYOptions=function(){
    var data=JSON.parse(window.localStorage.data);
    if(window.localStorage.lang == 'en'){
        data=JSON.parse(window.localStorage.data_en);
    }
    var MAYOptions={
        htmlGenerators:{
            channelsList:function(list,order){
                var out='';
                if(order){
                    for(z=0; z < order.length ; z++){
                        if(isNaN(order[z])){
                            out+=MAYOptions.htmlGenerators.multiMediaOption(data.mutlimedia.active);
                            continue;
                        }
                        out+='<span id="'+list[parseInt(order[z])-1].id+'" class="option f">';
                        out+='<input value="'+list[parseInt(order[z])-1].id+'" id="ch-'+list[parseInt(order[z])-1].id+'" type="checkbox" '+(list[parseInt(order[z])-1].active ?'checked="true"':'')+' class="styled" name="channels"/>';
                        out+=list[parseInt(order[z])-1].title
                        out+='</span>';
                    }
                }else{
                    for(i in list){
                        out+='<span id="'+list[i].id+'" class="option f">';
                        out+='<input value="'+list[i].id+'" id="ch-'+list[i].id+'" type="checkbox" '+(list[i].active ?'checked="true"':'')+' class="styled" name="channels"/>';
                        out+=list[i].title
                        out+='</span>';
                    }
                }
                return out;
            },
            multiMediaOption:function(active){
                var out = "";
                out+='<span id="multimedia" class="option f">';
                out+='<input id="mutilOption" type="checkbox" '+(active ?'checked="true"':'')+' class="styled" />';
                out+='ملتي ميديا'
                out+='</span>';
                return out;
            }
        },
        setChannels:function(){
            var data=JSON.parse(window.localStorage.data);
            var dataOrder = JSON.parse(window.localStorage.dataOrder);
            if(window.localStorage.lang == 'en'){
                data=JSON.parse(window.localStorage.data_en);
            }
            $("#channelList").html(MAYOptions.htmlGenerators.channelsList(data.channels,dataOrder));
            //$("#channelList").append(MAYOptions.htmlGenerators.multiMediaOption(data.mutlimedia.active));
            $( "#channelList" ).sortable();
        },
        save:function(){
            window.localStorage.dataOrder=JSON.stringify($('#channelList').sortable('toArray'));
            var selected=util.selectedRows('channels');
            if(selected.length == 0){
                $("#saveStatus").html('<div class="quick-alert">يجب أن تختار بعض الأخبار</div>')
                .fadeIn('slow')
                .animate({
                    opacity: 1.0
                }, 3000)
                .fadeOut('slow', function() {
                    $(this).html("");
                });
                return;
            }
            window.localStorage.selectedChannels=selected.length;
            var data=JSON.parse(window.localStorage.data);
            if(window.localStorage.lang == 'en'){
                data=JSON.parse(window.localStorage.data_en);
            }
            for(j in data.channels){
                if($.inArray(data.channels[j].id.toString(), selected) == -1){
                    data.channels[j].active = false;
                    delete window.localStorage['rss-cat-'+data.channels[j].id];
                }else{
                    data.channels[j].active = true;
                }
            }
            for(s=0; s < selected.length ; s++){
                if(window.localStorage['rss-cat-'+selected[s]]){
                    selected.splice($.inArray(selected[s], selected),1);
                    s--;
                }
            }
            data.mutlimedia.active=document.getElementById('mutilOption').checked;
            if(window.localStorage.lang == 'en'){
                window.localStorage.data_en=JSON.stringify(data);
            }else{
                window.localStorage.data=JSON.stringify(data);
            }
            
            chrome.extension.sendRequest({
                action:'update',
                ob:selected
            });
            $("#saveStatus").html('<div class="quick-alert">\u062a\u0645 \u0627\u0644\u062d\u0641\u0638</div>')
            .fadeIn('slow')
            .animate({
                opacity: 1.0
            }, 3000)
            .fadeOut('slow', function() {
                $(this).html("");
            });
        },
        domEvents:function(){
            $('#savesettings').click(function(){
                MAYOptions.save();
            });
            $("#closeNotification").val(window.localStorage.closeNotification);
            $("#closeNotification").change(function(){
                window.localStorage.closeNotification=this.value;
            });
            $("#showNotification").val(window.localStorage.showNotification);
            if(window.localStorage.showNotification == 'on'){
                $("#notifControl").show();
            }
            $("#showNotification").change(function(){
                window.localStorage.showNotification=this.value;
                if(this.value == 'on'){
                    $("#notifControl").show();
                }else{
                    $("#notifControl").hide();
                }
            });
            var checkall=true;
            $(":checkbox.styled").each(function(){
                if(! this.checked)
                    checkall=false;
            });
            if(checkall){
                $("#selectAllText").hide();
                $("#deselectAllText").show();
            }
            $("#selectAllBox").attr('checked',checkall);
            $("#selectAllBox").click(function(){
                checked=this.checked;
                $(":checkbox.styled").each(function(){
                    this.checked = checked;
                    $(this).trigger('change');
                });
                if(checked){
                    $("#selectAllText").hide();
                    $("#deselectAllText").show();
                }else{
                    $("#deselectAllText").hide();
                    $("#selectAllText").show();
                }
            });
            //            $("#lang-"+window.localStorage.lang).attr("selected", true);
            $("#lang").val(window.localStorage.lang);
            $("#lang").change(function(){
                window.localStorage.lang=this.value;
                //delete old data.
                for(j=0 ;j < data.channels.length ; j++){
                    localStorage.removeItem('rss-cat-'+data.channels[j].id);
                }
                window.location.reload();
            });
        },
        /**
         * returns the selected channels Orderd.
         */
        orderedSelectedChannels:function(list){
            var selected = new Array();
            for(z in list){
                if($("#"+list[z]+" > input").attr('checked')){
                    selected.push(list[z]);
                }
            }
            return selected;
        }

    }
    $(function(){
        MAYOptions.setChannels();
        MAYOptions.domEvents();
        if(! window.localStorage.showNotification){
            window.localStorage.showNotification = 'off';
        }
        if(! window.localStorage.closeNotification){
            window.localStorage.closeNotification = 0;
        }
    });
    return MAYOptions;
}
MAYOptions = new MAYOptions();
//for( i in window.localStorage){
//    delete window.localStorage[i];
//}
//localStorage.setItem("DATA", "m");
//for(i=0 ; i<40 ; i++) {
//    var data = localStorage.getItem("DATA");
//    try {
//        localStorage.setItem("DATA", data + data);
//    } catch(e) {
//        console.log("LIMIT REACHED: (" + i + ")");
//        console.log(e);
//    }
//}
//localStorage.removeItem("DATA");