while (true) {
  if (getServerSecurityLevel('foodnstuff') > getServerMinSecurityLevel('foodnstuff')) {
    await weaken('foodnstuff');
    continue;
  }

  if (getServerMoneyAvailable('foodnstuff') < getServerMaxMoney('foodnstuff')) {
    await grow('foodnstuff');
    continue;
  }

  await hack('foodnstuff');
}
