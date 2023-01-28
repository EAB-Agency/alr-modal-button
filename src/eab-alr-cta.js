window.addEventListener('load', setup);

let corsAPIFetchHTMLEndpoint = 'http://localhost:8888/api/boop';

let ctaButtonId = 'eab-cta-button';
let eabModalId = 'eab-modal';
let iframeID = 'eab-iframe';

// grab script tag that fired this event
let onPageScript = document.currentScript;

// grab text from inside the script tag
let buttonText = onPageScript.textContent;
// remove either single or double quotes from the text
buttonText = buttonText.replace(/["']/g, '');

// grab data attributes from the script tag
const { partnerurl } = onPageScript.dataset;

// going to use current url to pass to the api endpoint, so that we can track which page the user came from
var currentURL = window.location.hostname;

// build partner url with data attributes
const partnerLandingPage = `https://${partnerurl}?utm_source=${currentURL}&utm_medium=referral&utm_campaign=alr`;

let modalStyles = `
  #${eabModalId} {
  position: fixed;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.4);
  left : 0;
  top: 0;
  width: 0px;
  height : 0px;
  opacity: 0;
  transition: opacity 0.15s ease-out, width 0s linear 0.15s, height 0s linear 0.15s;
}

#${eabModalId}.visible {
  width: 100%;
  height: 100%;
  opacity: 1;
  transition: opacity 0.15s ease-out;
}

#${eabModalId} .modal {
    height: 90%;
  width: 90%;
  margin: 0 auto;
  width: 600px;
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  position: relative;
 top: 50%;
  transform: translateY(-50%);
  overflow-y: scroll
}

#${eabModalId} .modal .not-used {
  top: 50%;
  transform: translateY(-50%);
  overflow-y: scroll
}

#${iframeID} {
    width: 100%;
    height: 100%;
    border: none;
}
`;

function setup() {
  // create style element
  let style = document.createElement('style');
  style.innerHTML = modalStyles;
  document.head.appendChild(style);

  let modalRoot = document.createElement('div');
  modalRoot.id = eabModalId;

  let ctaButton = document.createElement('button');
  ctaButton.id = ctaButtonId;
  ctaButton.innerHTML = buttonText || 'CTA Button';

  // Add a close button
  let closeButton = document.createElement('button');
  closeButton.id = 'eab-closeButton';
  closeButton.innerHTML = 'Close';

  let modal = document.createElement('div');
  modal.classList.add('modal');
  modal.appendChild(closeButton);

  modalRoot.appendChild(modal);
  document.body.appendChild(modalRoot);
  //   button needs to be placed right where the script tag is
  onPageScript.parentNode.insertBefore(ctaButton, onPageScript);

  modalRoot.addEventListener('click', rootClick);
  ctaButton.addEventListener('click', openModal);
  modal.addEventListener('click', modalClick);
  closeButton.addEventListener('click', rootClick);

  function rootClick() {
    modalRoot.classList.remove('visible');
  }

  function openModal() {
    modalRoot.classList.add('visible');
  }

  function modalClick(e) {
    // e.preventDefault();
    e.stopPropagation();
    // e.stopImmediatePropagation();
    return false;
  }

  // call the function and pass in the partner landing page url and console out the HTML after it resolves
  getHTML(partnerLandingPage).then(html => {
    if (html) {
      console.log('📝 here comes the HTML!');
      let strippedHTML = stripStyles(html);
      let updatedLinksHTML = rewriteLinks(strippedHTML, partnerLandingPage);

      let contentsOfInnerHTML;

      contentsOfInnerHTML = createIframe(partnerLandingPage);
      modal.appendChild(contentsOfInnerHTML);

      //   if using these two below, then comment out the iframe above
      // problem with the below is not all the js works
      //   contentsOfInnerHTML = parseHTMLString(updatedLinksHTML);
      //     modal.innerHTML = contentsOfInnerHTML;
    }
  });
}

// function that takes a url and creates an ifram and appends it to modal
function createIframe(url) {
  let iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.id = iframeID
  iframe.style.width = parent.offsetWidth + 'px';
  return iframe;
}

// function that takes in html and returns the html with all the styles stripped out and the scripts added to the body of the page and relative links rewritten
function parseHTMLString(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const scripts = doc.getElementsByTagName('script');
  const links = doc.getElementsByTagName('link');

  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    const newScript = document.createElement('script');
    newScript.type = script.type;
    newScript.src = script.src;
    newScript.innerHTML = script.innerHTML;
    document.body.appendChild(newScript);
  }

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (link.rel === 'stylesheet') {
      const newLink = document.createElement('link');
      newLink.rel = link.rel;
      newLink.href = link.href;
      modal.appendChild(newLink);
    }
  }
  return doc.body.innerHTML;
}

// a function takes a url and calls the api endpoint http://localhost:8888/api/boop?url and returns a promise that resolves with the HTML from the partner landing page
async function getHTML(url) {
  try {
    const response = await fetch(corsAPIFetchHTMLEndpoint + '?url=' + url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json.html;
  } catch (error) {
    console.log(error);
  }
}

// a function that recieves the HTML from the partner landing page and strips out the <style> tags
function stripStyles(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const styles = doc.querySelectorAll('style, link[rel=stylesheet]');
  styles.forEach(style => style.remove());
  //  return html
  return doc.body.innerHTML;
}

function rewriteLinks(html, domain) {
  const regex = /<a[^>]*href=['"]([^'"]*)['"][^>]*>/gi;
  return html.replace(regex, (match, group) => {
    if (group.startsWith('/') && !group.startsWith('//')) {
      return match.replace(group, domain + group);
    }
    return match;
  });
}
