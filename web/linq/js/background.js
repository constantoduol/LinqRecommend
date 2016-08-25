
var listeners = {
    process_link : processLink
};

var scores = {
    click_link : 0.05,//when a link for a specific domain is clicked
    right_click_link : 0.02, //when a link is right clicked
    link_loaded : 0.15,//when the link clicked or directly loaded loads
    referrer_score : 0.03 //score given to a domain that a link was referred from(different domain)
};

chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            var resp = listeners[request.msg].call(this,request.value);
            sendResponse({msg: request.msg, value: resp});
            return true;
});

function processLink(data){
    //track domain performance
    trackDomainScores(data.href,data.src,data.current_url);
    //track user interests
    return true;
}

function trackDomainScores(href,src,currentUrl){
    var clickedDomain = href.split("/")[2];
    var currentDomain = currentUrl.split("/")[2];
    
    get(clickedDomain, function(clickedData){
        get(currentDomain,function(currentData){
            
            clickedData = clickedData ? clickedData : {};
            var d = clickedData[clickedDomain] = clickedData[clickedDomain] 
                ? clickedData[clickedDomain] : {};
                
            currentData = currentData ? currentData : {};
            var c = currentData[currentDomain] = currentData[currentDomain]
                    ? currentData[currentDomain] : {};

            d.score = d.score ? d.score : 0;
            c.score = c.score ? c.score : 0;
            
            if (src === 'click') {
                //somebody clicked a link
                //in future we expect that the link clicked will result in a direct navigation
                if(currentDomain === clickedDomain){
                    //someone clicked a link from the same domain
                    //so add the clicked score to the domain and referrer score
                    d.score = d.score + scores.click_link + scores.referrer_score;
                    set(clickedData);
                }
                else {
                    d.score = d.score + scores.click_link;
                    c.score = c.score + scores.referrer_score;
                    set(currentData);
                }
            
            }
            else if (src === 'right_click') {
                //somebody clicked a link
                //in future we expect that the link clicked will result in a direct navigation
                if (currentDomain === clickedDomain) {
                    //someone clicked a link from the same domain
                    //so add the clicked score to the domain and referrer score
                    d.score = d.score + scores.right_click_link + scores.referrer_score;
                    set(clickedData);
                }
                else {
                    d.score += scores.right_click_link;
                    c.score += scores.referrer_score;
                    set(currentData);
                }
            }
            else if(src === 'direct'){
                //someone navigated here directly or indirectly through a link click
                c.score += scores.link_loaded;
                set(currentData);
            }
        });
    });

}

function trackUserInterests(){
    
}


function get(key,callback){
    chrome.storage.sync.get(key, function (value) {
        callback(value);
    });
}

function set(value){
    chrome.storage.sync.set(value);
}
