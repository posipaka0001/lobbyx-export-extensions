document.getElementById("start").addEventListener("click", () => {
  const urls = [
    // 'https://hirefire.thelobbyx.com/vacancies/689a339f138aa791a38cf3b4',
    // 'https://hirefire.thelobbyx.com/vacancies/689a3340138aa791a38cf3b3',
    // 'https://hirefire.thelobbyx.com/vacancies/68933b1a138aa791a38cea16',
    // 'https://hirefire.thelobbyx.com/vacancies/6891f0d0ef38356c0dfe7fa4',
    'https://hirefire.thelobbyx.com/vacancies/676eac052ccb84685fe17efb'
  ]

  chrome.runtime.sendMessage({ action: "start", urls });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "log") {
    document.getElementById("output").textContent += msg.data + "\n";
  }
});