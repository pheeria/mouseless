var selectSiblingTab = function (tab, step) {
    if (tab.index == 0 && step < 0) {
        chrome.tabs.query({windowId:tab.windowId},
                          function (tabs) {
                              if (tabs.length) {
                                  chrome.tabs.update(
                                      tabs.pop().id, {active:true});
                              }
                          });
        return;
    }
    chrome.tabs.query({index:tab.index + step, windowId:tab.windowId},
                      function (tabs) {
                          if (tabs.length) {
                              chrome.tabs.update(tabs[0].id, {active:true});
                          } else {
                              chrome.tabs.query({index:0, windowId:tab.windowId},
                                                function (tabs) {
                                                    if (tabs.length) {
                                                        chrome.tabs.update(tabs[0].id, {active:true});
                                                    }
                                                });
                          }
                      });
},

getAllTabs = function (request, sender, sendResponse) {
    chrome.tabs.query({"windowId":sender.tab.windowId},
                      function (tabs) {
                          if (tabs.length) {
                              sendResponse && sendResponse({tabs:tabs, currentTab:sender.tab});
                          }
                      });
},

activeTab = function (request, sender, sendResponse) {
    chrome.tabs.query({windowId:sender.tab.windowId, index:request.index},
                      function (tabs) {
                          if (tabs.length) {
                              chrome.tabs.update(tabs[0].id, {active:true});
                          }
                      });

},

reloadTab = function (request, sender, sendResponse) {
    chrome.tabs.reload();
},

closeCurrentTab = function (request, sender, sendResponse) {
    chrome.tabs.remove([sender.tab.id], function () {});
},

getLocalstorage = function (request, sender, sendResponse) {
    sendResponse({data:localStorage[request.key]});
}

actions = {
    'next-tab': function (request, sender) { selectSiblingTab(sender.tab, 1);},
    'previous-tab': function (request, sender) { selectSiblingTab(sender.tab, -1);},
    'get-all-tabs': getAllTabs,
    'active-tab': activeTab,
    'reload-tab':reloadTab,
    'close-current-tab':closeCurrentTab,
    'get-localstorage':getLocalstorage
};
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (actions.hasOwnProperty(request.method)) {
            actions[request.method](request, sender, sendResponse);
        }
        return true;
    });
