//when a user directly navigates to a link from the omnibox
$(document).ready(function(){
    captureLink("",window.location.href,'direct');
});

//when a user clicks directly on a link
$("a").on('click',function(){
    var href = $(this).attr("href");
    var text = $(this).html();
    captureLink(text,href,'click');
});

//when a user right clicks a link
$("a").bind("contextmenu", function (e) {
    var href = $(this).attr("href");
    var text = $(this).html();
    captureLink(text, href,'right_click');
});

function sendMessage(msg,value,callback){
    chrome.runtime.sendMessage({value: value, msg: msg}, function (response) {
        if(callback) callback(response);
    });
}

function captureLink(text,href,source){
    sendMessage('process_link',{
        text : text, 
        href : href,
        src : source,
        current_url : window.location.href
    });
}
//there are three ways a user navigates
//directly,by clicking a link, open link in new tab