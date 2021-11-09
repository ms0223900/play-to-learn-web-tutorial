import {
  initSelectedListItemIdx,
  HEADER_LIST_DATA,
} from './staticData.mjs';

const makeChapterListItem = ({
  chapterTitle = '',
  subChapterList = [],
}) => {
  const chapterListItem = document.createElement('li');
  chapterListItem.innerHTML = `<h3>${chapterTitle}</h3>`;
  const subChapterWrapper = document.createElement('ul');

  subChapterList.forEach(({
    meta, title
  }) => {
    const subChapterItemHTML = `
      <li class="${'chapter-link'}" meta="${meta}">
        ${title}
      </li>
    `;
    subChapterWrapper.innerHTML += subChapterItemHTML;
  });
  chapterListItem.appendChild(subChapterWrapper);

  return chapterListItem;
};

const renderChapterList = () => {
  const wrapper = document.querySelector('header ul');
  wrapper.innerHTML = '';
  HEADER_LIST_DATA.forEach(item => {
    const chapterItem = makeChapterListItem(item)
    wrapper.appendChild(chapterItem);
  })
}

(() => {
  const mainPartIframeEl = document.getElementById('mainPartIframe');
  const mainPartTitleEl = document.getElementsByClassName('main-part-title')[0];
  const headerLinkList = document.getElementsByClassName('chapter-link');

  let ctx = {
    state: {
      selectedLinkIdx: initSelectedListItemIdx,
    },

    setState(_state) {
      this.state = {
        ...this.state,
        ..._state,
      }
    },

    getState() {
      return this.state;
    }
  }

  const parseLinkMetaToPageLink = (linkMeta = '01-throw-coin_advanced') => {
    const [
      chapter,
      subChapter
    ] = linkMeta.split('_');
    const link = `./${chapter}/${subChapter}/index.html`;
    return link;
  }

  const updateMainPart = (linkEl = document.createElement('a')) => {
    if(mainPartIframeEl) {
      const linkMeta = linkEl.getAttribute('meta');
      const pageLink = parseLinkMetaToPageLink(linkMeta);
      mainPartIframeEl.setAttribute('src', pageLink);
      
      console.log(mainPartTitleEl)
      if(mainPartTitleEl) {
        mainPartTitleEl.innerText = linkMeta;
      }
    }
  }

  const updateLinkEl = (linkEl = document.createElement('div'), i) => {
    linkEl.classList.remove('active');
    if(ctx.getState().selectedLinkIdx === i) {
      linkEl.classList.add('active');
    }
  }

  const upLinkElList = (linkElList = []) => {
    linkElList.forEach(updateLinkEl)
  }

  const linkElListRegister = () => {
    [...headerLinkList].forEach((linkEl, i) => {
      linkEl.addEventListener('click', () => {
        ctx.setState({
          selectedLinkIdx: i,
        });
        updateMainPart(linkEl);
        upLinkElList([...headerLinkList]);
      })
    })
  }

  const initLinkClicked = () => {
    const linkEl = headerLinkList[initSelectedListItemIdx];
    linkEl && linkEl.click();
  }

  function main() {
    renderChapterList();
    linkElListRegister();
    initLinkClicked();
  }

  main();
})()