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
            var data=JSON.parse(window.localStorage.data);
            for(j in data.channels){
                data.channels[j].active=false;
                delete window.localStorage['rss-cat-'+data.channels[j].id];
            }
            for(i in selected){
                data.channels[parseInt(selected[i])-1].active=true
            }
            window.localStorage.data=JSON.stringify(data);
            chrome.extension.sendRequest({
                'action':'update'
            });
        },
        domEvents:function(){
            $('#savesettings').click(function(){
                MAYOptions.save();
            });
            $("#closeNotification").val(window.localStorage.closeNotification);
            $("#closeNotification").change(function(){
                window.localStorage.closeNotification=this.value;
            })
            $("#showNotification").val(window.localStorage.showNotification);
            $("#showNotification").change(function(){
                window.localStorage.showNotification=this.value;
            });
        }

    }
    $(function(){
        MAYOptions.setChannels();
        MAYOptions.domEvents();
        if(! window.localStorage.showNotification){
            window.localStorage.showNotification = 0;
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