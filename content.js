(() => {
  const candidates = document.querySelectorAll('[data-candidate]')

  const data = candidates ? Array.from(candidates).map(candidate => {
    const fields = {
      id: candidate.dataset.candidate,
      fullName: candidate.querySelector('.form-name')?.textContent,
      email: candidate.querySelector('.form-info a')?.textContent,
      phoneNumber: parsePhoneNumber(candidate.querySelector('.form-info div:last-child')?.textContent),
      vacancy: {
        title: document.querySelector('h1').textContent.split(' - ')[0].trim(),
        url: window.location.href,
      },
      created: parseDate(candidate.querySelector('.divTableCellTime').textContent.trim()),
    }

    const files = candidate.querySelector('.display-files')?.children;

    files && Array.from(files).forEach((file) => {
      if (file.textContent.includes('CV')) {
        fields.cvLink = window.location.href + file.href;
      }
    })

    return fields;
  }) : undefined;

  const paginationController = document.querySelector('[data-controller="components--pagination"]');
  const numberOfPages = paginationController?.getElementsByClassName('page')?.length;

  const urlParams = new URLSearchParams(window.location.search);
  const isFirstPage = !urlParams.has('page');

  console.log(data)

  if (isFirstPage && numberOfPages) {
    chrome.runtime.sendMessage({ action: "dataExtracted", data, numberOfPages });
  } else {
    chrome.runtime.sendMessage({ action: "dataExtracted", data });
  }

  window.close();
})();

function parsePhoneNumber(text) {
  const regex = /(?:\+?3?8)?[\s\-]?\(?0?\d{2}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}|\b\d{9}\b/g;

  const match = text.match(regex)?.[0];

  if (!match) return null;

  function normalizePhone(phone) {
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('380')) return digits;
    if (digits.startsWith('0')) return '38' + digits;
    if (digits.length === 9) return '380' + digits;
    return null;
  }

  return normalizePhone(match);
}

function parseDate(str) {
  const [datePart, timePart] = str.split(' ');

  const [day, month, year] = datePart.split('.').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  const date = new Date(year, month - 1, day, hours, minutes);

  return date.toISOString();
}
