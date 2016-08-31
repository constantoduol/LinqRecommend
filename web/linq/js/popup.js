
/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
 
    callback(url);
  });

}

function saveSettings(){
    getCurrentTabUrl(function (url) {
        var domain = url.split("/")[2];
        var settings = {
          settings : {
            disable_all_pages : $("#disable_all_pages")[0].checked,
            color_links : $("#color_links")[0].checked
        }};
        settings.settings[domain] = $("#disable_this_page")[0].checked;
        chrome.storage.sync.set(settings);
        window.close();
    }); 
}

function deleteHistory(){
    if(confirm("Are you sure you want to do this? You will lose all your recommendation data.")){
        //do the dirty work here
    }
}

function get(key, callback) {
    chrome.storage.sync.get(key, function (value) {
        callback(value);
    });
}

function set(value) {
    chrome.storage.sync.set(value);
}

function round(num){
    return Math.round(parseFloat(num)*100)/100;
}

document.addEventListener("DOMContentLoaded",function(){
    getCurrentTabUrl(function (url) {
        var domain = url.split("/")[2];
        $("#this_page").html(domain);
        chrome.storage.sync.get('settings', function (store) {
            store.settings = store.settings ? store.settings : {};
            $("#disable_all_pages")[0].checked = store.settings.disable_all_pages;
            $("#disable_this_page")[0].checked = store.settings[domain]; 
            $("#color_links")[0].checked = store.settings.color_links;
            
            get('domains',function(domains){
                var d = domains.domains;
                var score = d[domain] ? round(d[domain].score) : 0;
                $("#the_domain_score").html(score);
            });
            
            get('word_store', function (store) {
                console.log(store);
                var theWords = "";
                for(var word in store.word_store){
                    theWords += word + " : " + store.word_store[word].hits + "<br/>";
                }
                $("#the_words").html(theWords);
            });
        });
    });
    
    $.material.init();
    document.getElementById("save_btn").addEventListener("click", function () {
        saveSettings();
    });
    
    document.getElementById("delete_btn").addEventListener("click", function () {
        deleteHistory();
    });
});

//#00E676
//#00B0FF
//#009688
//#FF5722
//#F44336

