/*
 * changing locals to page accourding to the presetted locals or from navegator local language.
 * How to : add attribute local to each element you want (i.e.: <div local="localvariable"> Some Text </div> ) to set it's local language and add local value to Mylocals variable for each language
 * you want to view (i.e.:  Mylocals={ar:{localvariable:'Some Text In Arabic'},en:{localvariable:'Some Text in English'}} ).
 * set extra css file path and name you want to add to the RTLStyle variable.
 */
var Mylocals={
    ar:{
        "arlang":"عربي",
        "enlang":"English",
        "generalSettings":"إعدادات عامة",
        "showNotifications":"إظهار التنبيهات",
        "notOff":"معطل",
        "notOn":"مفعل",
        "notificationTimeout":"إخفاء التنبيهات",
        "manual":"يدوي",
        "10times":"10 ثانية",
        "20times":"20 ثانية",
        "30times":"30 ثانية",
        "40times":"40 ثانية",
        "50times":"50 ثانية",
        "60times":"60 ثانية",
        "chooseNews":"اختر أخبارك",
        "chooseAll":"اختيار الكل",
        "chooseNone":"عدم اختيار الكل",
        "saveChanges":"حفظ التعديلات",
        "savingdone":"تم الحفظ",
        "youhavetochoose":"يجب أن تختار بعض الأخبار"
    },
    en:{
        "arlang":"عربي",
        "enlang":"English",
        "generalSettings":"General Settings",
        "showNotifications":"Alerts",
        "notOff":"Disabled",
        "notOn":"Enabled",
        "notificationTimeout":"Hide Alerts",
        "manual":"Manual",
        "10times":"10 Seconds",
        "20times":"20 Seconds",
        "30times":"30 Seconds",
        "40times":"40 Seconds",
        "50times":"50 Seconds",
        "60times":"60 Seconds",
        "chooseNews":"Choose Categories",
        "chooseAll":"Select All",
        "chooseNone":"Deselect All",
        "saveChanges":"Save Changes",
        "savingdone":"saving done",
        "youhavetochoose":"You have to choose one section at least"
    }
}
var RTLStyle='css/options-e.css';
var Logo='images/options_logo-e.png';
var setLocals = function(){
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
    var lang=window.localStorage.lang;
    if(lang == 'en'){
        var link=document.createElement("link");
        link.setAttribute("href", RTLStyle);
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        $('head').append(link);
        $(".logo").children("img").attr('src',Logo);
    }
    try{
        $("*").each(function(){
            var local=$(this).attr("local");
            if(local != null && local != undefined){
                $(this).text((Mylocals[lang])[local]);
            }
        });
    }catch(e){
        console.log(e);
    }
}
$(function(){
    setLocals();
});