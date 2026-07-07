async function test() {
  const YF = (await import('yahoo-finance2')).default;
  let yahooFinance;
  try {
    yahooFinance = new YF();
  } catch (e) {
    yahooFinance = YF;
  }
  const q = await yahooFinance.quote('RELIANCE.NS');
  console.log(q.symbol);
}
test();
