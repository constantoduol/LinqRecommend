
var listeners = {
    process_link : processLink
};

var scores = {
    click_link : 0.05,//when a link for a specific domain is clicked
    right_click_link : 0.02, //when a link is right clicked
    link_loaded : 0.15,//reward we give to a domain for being loaded
    referrer_score_same_domain : 0.02, //reward we give to a domain for referring us to itself
    referrer_score_diff_domain : 0.03  //reward we give to a domain we are coming from for referring us to a different domain
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
    trackUserInterests(data.text,data.href);
    //track user interests
    return true;
}

function trackDomainScores(href,src,currentUrl){
    var clickedDomain = href.split("/")[2];
    var currentDomain = currentUrl.split("/")[2];
    get('domains',function(domains){
        console.log(domains);
        domains = domains.domains ? domains : {domains : {}};
        var d = domains.domains[clickedDomain];
        var c = domains.domains[currentDomain];
        c = c ? c : {};
        d = d ? d : {};           
//        clickedData = clickedData ? clickedData : {};
//        //domains.domains[clickedDomain] = clickedData;
//        
//        var d = clickedData[clickedDomain] = clickedData[clickedDomain]
//                ? clickedData[clickedDomain] : {};
//        
//        currentData = currentData ? currentData : {};
//       //domains.domains[currentDomain] = currentData;
//        var c = currentData[currentDomain] = currentData[currentDomain]
//                ? currentData[currentDomain] : {};

        d.score = d.score ? d.score : 0;
        c.score = c.score ? c.score : 0;

        if (src === 'click') {
            //somebody clicked a link
            //in future we expect that the link clicked will result in a direct navigation
            if (currentDomain === clickedDomain) {
                //someone clicked a link from the same domain
                //so add the clicked score to the domain and referrer score
                d.score = d.score + scores.referrer_score_same_domain;//reward this domain for an internal link clicked
                set(domains);
            }
            else {
                d.score = d.score + scores.click_link;//reward the domain we are going to
                c.score = c.score + scores.referrer_score_diff_domain;//reward the domain we are coming from
                set(domains);
            }

        }
        else if (src === 'right_click') {
            //somebody clicked a link
            //in future we expect that the link clicked will result in a direct navigation
            if (currentDomain === clickedDomain) {
                //someone clicked a link from the same domain
                //so add the clicked score to the domain and referrer score
                d.score = d.score + scores.referrer_score_same_domain;
                set(domains);
            }
            else {
                d.score = d.score + scores.right_click_link;//reward the domain we are going to
                c.score = c.score + scores.referrer_score_diff_domain;//reward the domain we are coming from
                set(domains);
            }
        }
        else if (src === 'direct') {
            //someone navigated here directly or indirectly through a link click
            c.score += scores.link_loaded;
            set(domains);
        }
    });


}

function trackUserInterests(text,href){
    //extract text from the link and the href
    //use this to create a profile of the user
    if(!text) return true;
    var words = text.split(" ");
    get('word_store',function(wordStore){
        wordStore = wordStore.word_store ? wordStore :  {word_store : {}};
        for(var x = 0; x < words.length; x++){
            var word = words[x];
            if(!word) continue;
            var storedWord = wordStore.word_store[word] || {};
            storedWord.hits = storedWord.hits || 0;
            storedWord.hits++;
            wordStore.word_store[word] = storedWord;
            console.log(wordStore);
            set(wordStore);
        }
    });
}


function get(key,callback){
    chrome.storage.sync.get(key, function (value) {
        callback(value);
    });
}

function set(value){
    chrome.storage.sync.set(value);
}
