export default function co<T>(genFn: () => Generator<T>) {
  return new Promise((res, rej) => {
    const gen = genFn();
    const doAction = (action: (val: any) => IteratorResult<T>) => (val?: any) => {
      try {
        const result = action.call(gen, val);
        handleResult(result);
      } catch (err) {
        rej(err);
      }
    }
    const doNext = doAction(gen.next);
    const doThrow = doAction(gen.throw);
    const handleResult = (result: IteratorResult<T>) => {
      if (result.done) {
        res(result.value);
      } else {
        Promise.resolve(result.value).then(doNext).catch(doThrow);
      }
    }
    doNext();
  });
}