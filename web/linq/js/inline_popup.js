//when a user directly navigates to a link from the omnibox
$(document).ready(function(){
    captureLink("",window.location.href,'direct');
});

//when a user clicks directly on a link
$("a").on('click',function(){
    var href = $(this).attr("href");
    var text = $(this).text().trim();
    captureLink(text,href,'click');
});

//when a user right clicks a link
$("a").bind("contextmenu", function (e) {
    var href = $(this).attr("href");
    var text = $(this).text().trim();
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

function renderUserProfile(){
    //show the user the links he prefers most
    chrome.storage.sync.get('settings', function (store) {
        store.settings = store.settings ? store.settings : {};
        var domain = window.location.href.split("/")[2];
        if(store.settings.disable_all_pages || store.settings[domain]) return; //do nothing
        var colorLinks = store.settings.color_links;
        chrome.storage.sync.get('word_store', function (store) {
            chrome.storage.sync.get('word_store', function (store) {
                
            });
        });
    });
}
//there are three ways a user navigates
//directly,by clicking a link, open link in new tab