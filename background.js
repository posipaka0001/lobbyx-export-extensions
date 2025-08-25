let urlsToVisit = [
  // 'https://hirefire.thelobbyx.com/vacancies/689a339f138aa791a38cf3b4',
  // 'https://hirefire.thelobbyx.com/vacancies/689a3340138aa791a38cf3b3',
  // 'https://hirefire.thelobbyx.com/vacancies/68933b1a138aa791a38cea16',
  'https://hirefire.thelobbyx.com/vacancies/6891f0d0ef38356c0dfe7fa4',

  // 'https://hirefire.thelobbyx.com/vacancies/676eac052ccb84685fe17efb' // Front End Developer
];
let currentIndex = 0;
let data = [];
let scrapeInProgress = false;

chrome.action.onClicked.addListener(() => {
  if (scrapeInProgress) return;
  scrapeInProgress = true;

  showLoadingIcon();

  console.log('Clicked on the browser');
  currentIndex = 0;
  openNextUrl();
})

chrome.runtime.onMessage.addListener((msg, sender) => {
  switch (msg.action) {
    // case "start": {
    //   urlsToVisit = msg.urls;
    //   currentIndex = 0;
    //   openNextUrl();
    //
    //   break;
    // }

    case "dataExtracted": {
      data = data.concat(msg.data)

      if (msg.numberOfPages) addAllPagesToURLs(msg.numberOfPages);

      currentIndex++;
      openNextUrl();

      break;
    }
  }
});

function openNextUrl() {
  if (currentIndex >= urlsToVisit.length) {
    scrapeInProgress = false;
    console.log(data);
    showDefaultIcon();
    // chrome.runtime.sendMessage({ action: "log", data: "✅ Done scraping!" });
    return;
  }

  chrome.tabs.create({ url: urlsToVisit[currentIndex], active: false }, (tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  });
}

function showLoadingIcon() {
  chrome.action.setIcon({ path: '/icons/loading32.png' })
}

function showDefaultIcon() {
  chrome.action.setIcon({ path: '/icons/icon32.png' })
}

function addAllPagesToURLs(numberOfPages) {
  const currentURL = urlsToVisit[currentIndex];

  const restPages = new Array(numberOfPages - 1).fill(null).map((_, index) => {
    return `${currentURL}?page=${index + 2}`;
  });

  urlsToVisit.splice(currentIndex + 1, 0, ...restPages);
}
