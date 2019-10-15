import co from './index';

describe('co', () => {
  let getValLaterSpy: jest.Mock;
  let getValNowSpy: jest.Mock;
  const getValLater = (time: number) => <T>(val: T) => {
    return new Promise<T>((res) => {
      setTimeout(() => {
        getValLaterSpy(val);
        res(val);
      }, time);
    });
  };
  const getValNow = <T>(val: T) => {
    getValNowSpy(val);
    return val;
  };
  const getRejectedLater = (time: number) => (val: any) => {
    return new Promise((res, rej) => {
      setTimeout(() => rej(new Error('Fake rejection error')), time);
    });
  };
  const throwNow = (val: any): never => {
    throw new Error('Fake throw error');
  };
  beforeEach(() => {
    getValLaterSpy = jest.fn();
    getValNowSpy = jest.fn();
    jest.resetAllMocks();
  });
  it('should await each item in order', () => {
    return co(function* () {
      const val1 = yield getValLater(300)(1);
      const val2 = yield getValLater(200)(2);
      const val3 = yield getValLater(100)(3);
      return [val1, val2, val3];
    }).then((vals) => {
      expect(vals).toEqual([1, 2, 3]);
      expect(getValLaterSpy.mock.calls[0][0]).toBe(1);
      expect(getValLaterSpy.mock.calls[1][0]).toBe(2);
      expect(getValLaterSpy.mock.calls[2][0]).toBe(3);
    });
  });
  it('should treat non-thenable values like Resolved promises', () => {
    return co(function* () {
      const val1 = yield getValLater(300)(1);
      const val2 = yield getValNow(2);
      const val3 = yield getValLater(100)(3);
      return [val1, val2, val3];
    }).then((vals) => {
      expect(vals).toEqual([1, 2, 3]);
      expect(getValLaterSpy.mock.calls[0][0]).toBe(1);
      expect(getValNowSpy.mock.calls[0][0]).toBe(2);
      expect(getValLaterSpy.mock.calls[1][0]).toBe(3);
    });
  });
  it('should resolve to the return value of the co generator', () => {
    const prom = co(function* () {
      yield getValLater(300)(1);
      return 'MyReturnValue';
    });
    expect(getValLaterSpy.call.length).toBe(1);
    expect(prom).resolves.toBe('MyReturnValue');
    return prom;
  });
  it('should resolve to undefined if generator has no return', () => {
    const prom = co(function* () {
      yield getValLater(300)(1);
    });
    expect(prom).resolves.toBeUndefined();
    return prom;
  });
  it('should reject the co promise if an awaited promise rejects', () => {
    const prom = co(function* () {
      yield getValLater(300)(1);
      yield getRejectedLater(100)('foo');
    }).catch((err) => err);
    expect(prom).resolves.toMatchObject({ message: 'Fake rejection error' });
    return prom;
  });
  it('should reject the co promise if a sync error is thrown', () => {
    const prom = co(function* () {
      yield getValNow(10);
      yield throwNow('any');
    }).catch((err) => err);
    expect(prom).resolves.toMatchObject({ message: 'Fake throw error' });
    return prom;
  });
  it('should let the generator catch a rejected promise', () => {
    const prom = co(function* () {
      try {
        yield getRejectedLater(100)('err');
      } catch (err) {
        expect(err).toMatchObject({ message: 'Fake rejection error' });
        return 'I caught it';
      }
    });
    expect(prom).resolves.toBe('I caught it');
    return prom;
  });
  it('should let the generator catch thrown errors', () => {
    const prom = co(function* () {
      try {
        yield throwNow('err');
      } catch (err) {
        expect(err).toMatchObject({ message: 'Fake throw error' });
        return 'I caught it';
      }
    });
    expect(prom).resolves.toBe('I caught it');
    return prom;
  });
});
