let urlsToVisit = [];
let currentIndex = 0;
let scrapeInProgress = false;
let data = [];

chrome.action.onClicked.addListener(async () => {
  scrapeInProgress = true;
  showLoadingIcon();

  urlsToVisit = await fetchVacancies();

  currentIndex = 0;
  openNextUrl();
});


chrome.runtime.onMessage.addListener(async (msg, sender) => {
  switch (msg.action) {
    case "dataExtracted": {
      data = data.concat(msg.data);

      if(msg.numberOfPages) addAllPagesToURLs(msg.numberOfPages);

      currentIndex++;

      if (currentIndex >= urlsToVisit.length) {
        scrapeInProgress = false;
        urlsToVisit = [];

        await sendDataToBackend(data);

        showDefaultIcon();

        break;
      }

      openNextUrl();

      break;
    }
  }
});

function openNextUrl() {
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

function skipNextPages() {
  const currentURL = urlsToVisit[currentIndex];

  urlsToVisit = urlsToVisit.filter(url => !url.startsWith(`${currentURL}?page=`));
}

async function fetchVacancies() {
  const response = await fetch('https://script.google.com/macros/s/AKfycbwrt52GVYs93h1tgvqJzXKRpZ9dBGx2qaGM_VOnfDrApYg7A53CozJjaKyOpOUQaUY/exec');

  return response.json();
}

async function sendDataToBackend(data) {
  const response = await fetch('https://script.google.com/macros/s/AKfycbzNXEh1QobI_5hXQegvxV8tEOa_H4wdaGTnMxX6h05gwJZtJ7D081tXANs_LvA_XHA/exec', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}
