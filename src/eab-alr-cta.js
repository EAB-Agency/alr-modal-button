window.addEventListener('load', setup);

let corsAPIFetchHTMLEndpoint = 'https://alr.netlify.app/api/cors';

let ctaButtonId = 'eab-cta-button';
let eabModalId = 'eab-modal';
let iframeID = 'eab-iframe';
let modalHeight = 90;
let closeButtonId = 'eab-closeButton';

// grab script tag that fired this event
let onPageScript = document.currentScript;

// grab classList from the script tag
let classList = onPageScript.classList;

// grab text from inside the script tag
let buttonText = onPageScript.textContent;
// remove either single or double quotes from the text
buttonText = buttonText.replace(/["']/g, '');

// grab data attributes from the script tag
const { partnerurl, height } = onPageScript.dataset;
// if height is not set, then set it to 100
modalHeight = height || modalHeight;

// going to use current url to pass to the api endpoint, so that we can track which page the user came from
var currentURL = window.location.hostname;

// build partner url with data attributes
const partnerLandingPage = `https://${partnerurl}?utm_source=${currentURL}&utm_medium=referral&utm_campaign=alr`;

let modalStyles = `
:where(html) {
  --eab-blue-500: #002746;
  --eab-blue-400: #1070bc;
  --eab-teal: #00b1b0;
  --eab-orange: #ed8b00;
  --eab-grey: #606060;
  --modal-overlay-color: rgba(0, 0, 0, 0.6);
  --modal-background-color: white;
  --hover-animation: all 0.2s ease-out;
  --modal-max-width: 48rem;
}

:where(#${ctaButtonId}) {
  background-color: var(--eab-blue-500);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: var(--hover-animation);
}

:where(#${ctaButtonId}):hover{
  background-color: var(--eab-blue-400);
} 

  #${eabModalId} {
    display:flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    overflow: hidden;
    background-color: var(--modal-overlay-color);
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
    height:  ${modalHeight}%;
    width: 90%;
    max-width: var(--modal-max-width);
    background-color: var(--modal-background-color);
    padding-top: 3rem;
    position: relative;
}

#${eabModalId} .modal .not-used {
  top: 50%;
  transform: translateY(-50%);
  overflow-y: scroll
}

:is(#${iframeID}) {
    width: 100%;
    height: 100%;
    border: none;
    background: white;
}

:where(#${closeButtonId}){
  position: absolute;
  top: 0.5em;
  right: 0.5em;
  // background-color: white;
  border: none;
  width: 2rem;
  height: 2rem;
  text-indent: -9999px;
  cursor: pointer;
  transition: var(--hover-animation);
}

:where(#${closeButtonId})::before,
:where(#${closeButtonId})::after{
  content: '';
  display: block;
  position: absolute;
  width: 0.1em;
  height: 0.7em;
  top: 50%;
  left: 50%;
  background-color: var(--eab-grey);
  transform: translate(-50%, -50%) rotate(45deg);
  font-size: clamp(1rem, 2vw, 2rem);
  transition: var(--hover-animation);
}

:where(#${closeButtonId})::after{
  transform: translate(-50%, -50%) rotate(-45deg);
}

:where(#${closeButtonId}):hover{
  background: white;
}

:where(#${closeButtonId}):hover::before,
:where(#${closeButtonId}):hover::after{
  background: var(--eab-blue-500);
  width: 0.2em;
  height: 1em;
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
  for (const className of classList) {
    ctaButton.classList.add(className);
  }
  ctaButton.innerHTML = buttonText || 'CTA Button';

  // Add a close button
  let closeButton = document.createElement('button');
  closeButton.id = closeButtonId;
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

   contentsOfInnerHTML = createIframe(partnerLandingPage);
   modal.appendChild(contentsOfInnerHTML);

  // call the function and pass in the partner landing page url and console out the HTML after it resolves
  // getHTML(partnerLandingPage).then(html => {
  //   if (html) {
  //     console.log('📝 here comes the HTML!');
  //     let strippedHTML = stripStyles(html);
  //     let updatedLinksHTML = rewriteLinks(strippedHTML, partnerLandingPage);

  //     let contentsOfInnerHTML;

     

  //     //   if using these two below, then comment out the iframe above
  //     // problem with the below is not all the js works
  //       // contentsOfInnerHTML = parseHTMLString(updatedLinksHTML);
  //       //   modal.innerHTML = contentsOfInnerHTML;
  //   }
  // });
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
