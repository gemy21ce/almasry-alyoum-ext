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
                    out+='<tr>';
                    out+='<td>';
                    out+='<input value="'+list[i].id+'" type="checkbox" '+(list[i].active ?'checked':'')+' name="channels"/>';
                    out+='</td>';
                    out+='<td>';
                    out+=list[i].title
                    out+='</td>';
                    out+='</tr>';
                }
                return out;
            }
        },
        setChannels:function(){
            var data=JSON.parse(window.localStorage.data);
            $("#channels").html(MAYOptions.htmlGenerators.channelsList(data.channels))
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
            })
        }

    }
    $(function(){
        MAYOptions.domEvents();
        MAYOptions.setChannels();
    });
    return MAYOptions;
}
MAYOptions = new MAYOptions();
//for( i in window.localStorage){
//    delete window.localStorage[i];
//}