/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var MAYOptions=function(){
    var MAYOptions={
        htmlGenerators:{
            channelsList:function(list){
                var out='';
                for(i in list){
                    out+='<span id="'+list[i].id+'" class="option f">';
                    out+='<input value="'+list[i].id+'" id="ch-'+list[i].id+'" type="checkbox" '+(list[i].active ?'checked="true"':'')+' class="styled" name="channels"/>';
                    out+=list[i].title
                    out+='</span>';
                }
                return out;
            }
        },
        setChannels:function(){
            var data=JSON.parse(window.localStorage.data);
            $("#channelList").html(MAYOptions.htmlGenerators.channelsList(data.channels));
        },
        save:function(){
            var selected=util.selectedRows();
            window.localStorage.selectedChannels=selected.length;
            var data=JSON.parse(window.localStorage.data);
            for(j in data.channels){
                if($.inArray(data.channels[j].id.toString(), selected) == -1){
                    data.channels[j].active = false;
                    delete window.localStorage['rss-cat-'+data.channels[j].id];
                }else{
                    data.channels[j].active = true;
                }
            }
            for(s in selected){
                if(window.localStorage['rss-cat-'+selected[s]]){
                    selected.splice($.inArray(selected[s], selected),1);
                }
            }
            window.localStorage.data=JSON.stringify(data);
            chrome.extension.sendRequest({
                action:'update',
                ob:selected
            });
        },
        domEvents:function(){
            $('#savesettings').click(function(){
                MAYOptions.save();
                $('<div class="quick-alert">تم الحفظ</div>')
                .insertAfter( $(this) )
                .fadeIn('slow')
                .animate({
                    opacity: 1.0
                }, 3000)
                .fadeOut('slow', function() {
                    $(this).remove();
                });
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