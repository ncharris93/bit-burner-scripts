import { NS } from '@ns';
import { sendKeyboardEvent } from './event';

const Games = ['guard', 'match'] as const;
type Game = (typeof Games)[number];

const getGameTitle = () => {
  return Array.from(document.querySelectorAll('h4')).reduce((gameName, ele: HTMLElement) => {
    const included = Games.find((g) => ele.innerText.includes(g));
    return included || gameName;
  }, '');
};

export async function main(ns: NS) {
  while (true) {
    await doGameSum(ns);
  }
}

const doGameSum = async (ns: NS) => {
  const gameTitle = getGameTitle();
  switch (gameTitle as Game) {
    case 'guard': {
      return Infiltrate.Attack(ns);
    }
    case 'match': {
      return Infiltrate.Match(ns);
    }
    default: {
      return ns.sleep(100);
    }
  }
};

type Query = Parameters<typeof document.querySelectorAll>[0];
const findEleThatMatchesText = (query: Query, text: string | ((str: string) => boolean), opt?: { all?: boolean }) => {
  const queryArr = Array.from(document.querySelectorAll(query));

  const iterator = (ele: unknown): boolean => {
    const innerText = (ele as HTMLElement).innerText;
    if (typeof text === 'string') {
      return innerText.toLocaleLowerCase().includes(text.toLocaleLowerCase());
    }
    return text(innerText.toLocaleLowerCase());
  };

  if (opt?.all) {
    return queryArr.filter(iterator);
  }

  return queryArr.find(iterator);
};

const Infiltrate = {
  Attack: async (ns: NS) => {
    while (true) {
      const textToWatch = Array.from(document.querySelectorAll('h4'))[3].innerText;
      if (!textToWatch.includes('Guarding')) {
        return sendKeyboardEvent(ns, ' ');
      }
      await ns.sleep(100);
    }
  },
  Match: async (ns: NS) => {
    const REGEX_CODE = new RegExp(/^[a-zA-Z0-9]{2}$/);
    const targetArray = findEleThatMatchesText('h5', 'target')
      ?.innerHTML?.split(':')[1]
      .split(' ')
      .map((e) => e.trim())
      .filter(REGEX_CODE.test); // ['85', 'A1', '23', '62', 'BA', 'BE', '47', 'BA']

    const rawField = findEleThatMatchesText('p', REGEX_CODE.test, { all: true }) as Element[];
    //  const field = rawField.map(ele => )
  },
};
