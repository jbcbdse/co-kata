export default function co<T>(genFn: () => Generator<T>) {
  return new Promise((res, rej) => {
    const gen = genFn();
    const doNext = (val?: any) => {
      try {
        const result = gen.next(val);
        handleResult(result);
      } catch (err) {
        rej(err);
      }
    }
    const doErr = (err: any) => {
      try {
        const result = gen.throw(err);
        handleResult(result);
      } catch (err) {
        rej(err);
      }
    }
    const handleResult = (result: IteratorResult<T>) => {
      if (result.done) {
        res(result.value);
      } else {
        Promise.resolve(result.value).then(doNext).catch(doErr);
      }
    }
    doNext();
  });
}